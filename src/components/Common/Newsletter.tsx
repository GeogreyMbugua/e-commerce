import Image from "next/image";

const Newsletter = () => {
  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative z-1 overflow-hidden rounded-xl border border-brand-gold/25 bg-brand-ink">
          <Image
            src="/images/shapes/newsletter-bg.jpg"
            alt="Vintage audio equipment"
            className="absolute -z-1 h-full w-full left-0 top-0 rounded-xl object-cover opacity-25"
            width={1170}
            height={200}
          />
          <div className="absolute -z-1 inset-0 bg-brand-ink/80"></div>
          <div className="absolute -z-1 right-0 top-0 h-full w-1/2 bg-brand-rust/20"></div>

          <div className="relative flex flex-col gap-8 px-4 py-11 sm:px-7.5 xl:flex-row xl:items-center xl:justify-between xl:pl-12.5 xl:pr-14">
            <div className="max-w-[491px] w-full">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
                The Listening Room
              </p>
              <h2 className="mb-3 max-w-[430px] text-lg font-bold text-white sm:text-xl xl:text-heading-4">
                Stay tuned to the world of vintage audio
              </h2>
              <p className="max-w-[440px] text-white/80">
                Join our list for new arrivals, carefully selected classics,
                restoration stories, and occasional offers.
              </p>
            </div>

            <div className="max-w-[477px] w-full">
              <form>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Your email address"
                    aria-label="Your email address"
                    className="w-full rounded-md border border-white/20 bg-white px-5 py-3 text-brand-ink outline-none placeholder:text-brand-ink/50 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                  />
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md bg-brand-rust px-7 py-3 font-medium text-white transition-colors duration-200 hover:bg-brand-gold hover:text-brand-ink"
                  >
                    Join the list
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
