import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/shared/database/prisma.service.js';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  const resetCheckoutState = async () => {
    const prisma = app.get(PrismaService);

    await prisma.$transaction(async (tx) => {
      await tx.outboxEvent.deleteMany();
      await tx.customerAddress.deleteMany();
      await tx.customer.deleteMany();
      await tx.paymentWebhookEvent.deleteMany();
      await tx.payment.deleteMany();
      await tx.orderLine.deleteMany();
      await tx.order.deleteMany();
      await tx.orderIdempotencyKey.deleteMany();

      const activeReservations = await tx.inventoryReservation.findMany({
        where: { status: 'ACTIVE' },
      });

      for (const reservation of activeReservations) {
        await tx.inventoryItem.update({
          where: { id: reservation.inventoryItemId },
          data: {
            quantityReserved: {
              decrement: reservation.quantity,
            },
          },
        });
      }

      await tx.inventoryReservation.updateMany({
        where: { status: 'ACTIVE' },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
        },
      });

      await tx.checkoutSession.updateMany({
        where: { status: { in: ['OPEN', 'COMPLETED'] } },
        data: { status: 'CANCELLED' },
      });

      const seedInventory = [
        { slug: 'technics-sl-1200mk2-turntable', quantityAvailable: 1, quantityReserved: 0, status: 'AVAILABLE' as const },
        { slug: 'curated-vinyl-records', quantityAvailable: 12, quantityReserved: 0, status: 'AVAILABLE' as const },
        { slug: 'sony-ta-stereo-amplifier', quantityAvailable: 3, quantityReserved: 0, status: 'AVAILABLE' as const },
      ];

      for (const item of seedInventory) {
        const product = await tx.product.findUnique({
          where: { slug: item.slug },
          select: { inventory: { select: { id: true } } },
        });

        if (product?.inventory) {
          await tx.inventoryItem.update({
            where: { id: product.inventory.id },
            data: {
              quantityAvailable: item.quantityAvailable,
              quantityReserved: item.quantityReserved,
              status: item.status,
            },
          });
        }
      }
    });
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    await resetCheckoutState();
  });

  it('/api/v1/health/live (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health/live')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/api/v1/health/ready (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health/ready')
      .expect(200)
      .expect({
        status: 'ok',
        checks: {
          database: 'ok',
          redis: 'skipped',
        },
      });
  });

  it('/api/v1/meta/version (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/meta/version')
      .expect(200)
      .expect({
        service: 'api',
        version: '0.0.1',
      });
  });

  it('/api/v1/products (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/products')
      .expect(200)
      .expect((response) => {
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.page.hasMore).toBe(false);
      });
  });

  it('/api/v1/products/:slug (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/products/technics-sl-1200mk2-turntable')
      .expect(200)
      .expect((response) => {
        expect(response.body.slug).toBe('technics-sl-1200mk2-turntable');
        expect(response.body.isUniqueItem).toBe(true);
        expect(response.body.availableQuantity).toBe(1);
      });
  });

  it('/api/v1/categories (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/categories')
      .expect(200)
      .expect((response) => {
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toMatchObject({
          slug: expect.any(String),
          name: expect.any(String),
          productCount: expect.any(Number),
        });
      });
  });

  it('guest cart lifecycle (POST/GET/PATCH/DELETE)', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/carts')
      .send({})
      .expect(201);

    const guestToken = createResponse.body.guestToken as string;
    expect(guestToken).toMatch(/^cart_/);

    await request(app.getHttpServer())
      .get('/api/v1/carts/current')
      .set('X-Cart-Token', guestToken)
      .expect(200)
      .expect((response) => {
        expect(response.body.lines).toEqual([]);
        expect(response.body.itemCount).toBe(0);
      });

    await request(app.getHttpServer())
      .post('/api/v1/carts/current/lines')
      .set('X-Cart-Token', guestToken)
      .set('Idempotency-Key', 'test-add-line')
      .send({
        productSlug: 'sony-ta-stereo-amplifier',
        quantity: 1,
      })
      .expect(201)
      .expect((response) => {
        expect(response.body.itemCount).toBe(1);
        expect(response.body.lines[0].productSlug).toBe(
          'sony-ta-stereo-amplifier',
        );
      });

    await request(app.getHttpServer())
      .patch('/api/v1/carts/current/lines/sony-ta-stereo-amplifier')
      .set('X-Cart-Token', guestToken)
      .send({ quantity: 2 })
      .expect(200)
      .expect((response) => {
        expect(response.body.lines[0].quantity).toBe(2);
      });

    await request(app.getHttpServer())
      .delete('/api/v1/carts/current/lines/sony-ta-stereo-amplifier')
      .set('X-Cart-Token', guestToken)
      .expect(200)
      .expect((response) => {
        expect(response.body.lines).toEqual([]);
      });
  });

  it('rejects unique item quantity above one (POST line)', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/carts')
      .send({})
      .expect(201);

    const guestToken = createResponse.body.guestToken as string;

    await request(app.getHttpServer())
      .post('/api/v1/carts/current/lines')
      .set('X-Cart-Token', guestToken)
      .set('Idempotency-Key', 'unique-item-add')
      .send({
        productSlug: 'technics-sl-1200mk2-turntable',
        quantity: 2,
      })
      .expect(409)
      .expect((response) => {
        expect(response.body.code).toBe('UNIQUE_ITEM_LIMIT');
      });
  });

  it('creates a quote and checkout session with reservations', async () => {
    const cartResponse = await request(app.getHttpServer())
      .post('/api/v1/carts')
      .send({})
      .expect(201);

    const cartToken = cartResponse.body.guestToken as string;

    await request(app.getHttpServer())
      .post('/api/v1/carts/current/lines')
      .set('X-Cart-Token', cartToken)
      .set('Idempotency-Key', 'checkout-line')
      .send({
        productSlug: 'curated-vinyl-records',
        quantity: 1,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/quotes')
      .set('X-Cart-Token', cartToken)
      .send({ shippingMethod: 'standard' })
      .expect(201)
      .expect((response) => {
        expect(response.body.total.amountMinor).toBeGreaterThan(0);
        expect(response.body.lines.length).toBe(1);
      });

    const sessionResponse = await request(app.getHttpServer())
      .post('/api/v1/checkout-sessions')
      .set('X-Cart-Token', cartToken)
      .set('Idempotency-Key', 'checkout-session')
      .send({
        email: 'shopper@example.com',
        shippingMethod: 'standard',
      })
      .expect(201)
      .expect((response) => {
        expect(response.body.status).toBe('OPEN');
        expect(response.body.reservations.length).toBe(1);
        expect(response.body.guestToken).toMatch(/^checkout_/);
      });

    const checkoutToken = sessionResponse.body.guestToken as string;

    await request(app.getHttpServer())
      .get('/api/v1/checkout-sessions/current')
      .set('X-Checkout-Session-Token', checkoutToken)
      .expect(200)
      .expect((response) => {
        expect(response.body.email).toBe('shopper@example.com');
      });

    await request(app.getHttpServer())
      .delete('/api/v1/checkout-sessions/current')
      .set('X-Checkout-Session-Token', checkoutToken)
      .expect(200)
      .expect((response) => {
        expect(response.body.status).toBe('CANCELLED');
      });
  });

  it('creates an order, captures payment, and converts reservations', async () => {
    const cartResponse = await request(app.getHttpServer())
      .post('/api/v1/carts')
      .send({})
      .expect(201);

    const cartToken = cartResponse.body.guestToken as string;

    await request(app.getHttpServer())
      .post('/api/v1/carts/current/lines')
      .set('X-Cart-Token', cartToken)
      .set('Idempotency-Key', 'order-line')
      .send({
        productSlug: 'curated-vinyl-records',
        quantity: 1,
      })
      .expect(201);

    const sessionResponse = await request(app.getHttpServer())
      .post('/api/v1/checkout-sessions')
      .set('X-Cart-Token', cartToken)
      .set('Idempotency-Key', 'order-session')
      .send({
        email: 'buyer@example.com',
        shippingMethod: 'standard',
      })
      .expect(201);

    const checkoutToken = sessionResponse.body.guestToken as string;

    const orderResponse = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('X-Checkout-Session-Token', checkoutToken)
      .set('Idempotency-Key', 'create-order')
      .expect(201)
      .expect((response) => {
        expect(response.body.reference).toMatch(/^AV-/);
        expect(response.body.status).toBe('PENDING_PAYMENT');
        expect(response.body.payment.provider).toBe('dev');
      });

    const order = orderResponse.body;
    const accessToken = order.guestAccessToken as string;

    await request(app.getHttpServer())
      .get(`/api/v1/orders/${order.reference}`)
      .set('X-Order-Access-Token', accessToken)
      .expect(200)
      .expect((response) => {
        expect(response.body.email).toBe('buyer@example.com');
      });

    const paidResponse = await request(app.getHttpServer())
      .post(`/api/v1/payments/${order.payment.id}/simulate-capture`)
      .expect(201)
      .expect((response) => {
        expect(response.body.status).toBe('PAID');
        expect(response.body.payment.status).toBe('CAPTURED');
      });

    expect(paidResponse.body.paidAt).toBeTruthy();

    const prisma = app.get(PrismaService);
    const outboxEvent = await prisma.outboxEvent.findFirst({
      where: {
        aggregateId: order.id,
        eventName: 'order.paid.v1',
      },
    });
    expect(outboxEvent?.status).toBe('COMPLETED');

    await request(app.getHttpServer())
      .post('/api/v1/orders/lookup')
      .send({
        reference: order.reference,
        email: 'buyer@example.com',
      })
      .expect(201)
      .expect((response) => {
        expect(response.body.reference).toBe(order.reference);
        expect(response.body.guestAccessToken).toBe(accessToken);
      });

    await request(app.getHttpServer())
      .post('/api/v1/orders/lookup')
      .send({
        reference: order.reference,
        email: 'wrong@example.com',
      })
      .expect(404)
      .expect((response) => {
        expect(response.body.code).toBe('ORDER_NOT_FOUND');
      });

    await request(app.getHttpServer())
      .post(`/api/v1/payments/${order.payment.id}/simulate-capture`)
      .expect(201)
      .expect((response) => {
        expect(response.body.status).toBe('PAID');
      });
  });

  it('prevents overselling a unique item after reservation', async () => {
    const firstCart = await request(app.getHttpServer())
      .post('/api/v1/carts')
      .send({})
      .expect(201);

    const firstCartToken = firstCart.body.guestToken as string;

    await request(app.getHttpServer())
      .post('/api/v1/carts/current/lines')
      .set('X-Cart-Token', firstCartToken)
      .set('Idempotency-Key', 'unique-reserve-1')
      .send({
        productSlug: 'technics-sl-1200mk2-turntable',
        quantity: 1,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/checkout-sessions')
      .set('X-Cart-Token', firstCartToken)
      .set('Idempotency-Key', 'unique-session-1')
      .send({
        email: 'first@example.com',
      })
      .expect(201);

    const secondCart = await request(app.getHttpServer())
      .post('/api/v1/carts')
      .send({})
      .expect(201);

    const secondCartToken = secondCart.body.guestToken as string;

    await request(app.getHttpServer())
      .post('/api/v1/carts/current/lines')
      .set('X-Cart-Token', secondCartToken)
      .set('Idempotency-Key', 'unique-reserve-2')
      .send({
        productSlug: 'technics-sl-1200mk2-turntable',
        quantity: 1,
      })
      .expect(409)
      .expect((response) => {
        expect(['QUANTITY_EXCEEDS_STOCK', 'PRODUCT_UNAVAILABLE']).toContain(
          response.body.code,
        );
      });
  });

  it('supports customer auth, cart merge, order claim, and profile', async () => {
    const guestCart = await request(app.getHttpServer())
      .post('/api/v1/carts')
      .send({})
      .expect(201);

    const guestToken = guestCart.body.guestToken as string;

    await request(app.getHttpServer())
      .post('/api/v1/carts/current/lines')
      .set('X-Cart-Token', guestToken)
      .set('Idempotency-Key', 'customer-merge-line')
      .send({
        productSlug: 'sony-ta-stereo-amplifier',
        quantity: 1,
      })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/dev/login')
      .send({
        email: 'member@example.com',
        firstName: 'Alex',
        lastName: 'Listener',
      })
      .expect(201);

    const accessToken = loginResponse.body.accessToken as string;

    await request(app.getHttpServer())
      .get('/api/v1/customers/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.email).toBe('member@example.com');
        expect(response.body.firstName).toBe('Alex');
      });

    const mergedCart = await request(app.getHttpServer())
      .post('/api/v1/carts/current/merge')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Cart-Token', guestToken)
      .expect(201)
      .expect((response) => {
        expect(response.body.itemCount).toBe(1);
      });

    const mergedToken = mergedCart.body.guestToken as string;

    await request(app.getHttpServer())
      .post('/api/v1/carts/current/lines')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Cart-Token', mergedToken)
      .set('Idempotency-Key', 'customer-owned-line')
      .send({
        productSlug: 'curated-vinyl-records',
        quantity: 1,
      })
      .expect(201);

    const checkoutSession = await request(app.getHttpServer())
      .post('/api/v1/checkout-sessions')
      .set('X-Cart-Token', mergedToken)
      .set('Idempotency-Key', 'customer-checkout')
      .send({
        email: 'member@example.com',
      })
      .expect(201);

    const checkoutToken = checkoutSession.body.guestToken as string;

    const orderResponse = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-Checkout-Session-Token', checkoutToken)
      .set('Idempotency-Key', 'customer-order')
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/payments/${orderResponse.body.payment.id}/simulate-capture`)
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/customers/me/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.length).toBe(1);
        expect(response.body[0].reference).toBe(orderResponse.body.reference);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
