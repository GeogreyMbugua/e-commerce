const services = [
  {
    title: "Tested before listing",
    copy: "Condition and testing notes on every piece.",
  },
  {
    title: "Honest grading",
    copy: "Clear condition grades so you know what you are buying.",
  },
  {
    title: "Secure checkout",
    copy: "Protected payments with tracked order status.",
  },
];

const TrustServices = () => {
  return (
    <section aria-label="Shopping confidence" className="pt-10 sm:pt-12">
      <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <div className="grid gap-6 border-t border-brand-ink/10 pt-8 sm:grid-cols-3 sm:gap-8">
          {services.map((service) => (
            <div key={service.title}>
              <h3 className="mb-1 text-sm font-semibold text-brand-ink">
                {service.title}
              </h3>
              <p className="text-xs leading-relaxed text-brand-ink/65 sm:text-sm">
                {service.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustServices;
