import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React from "react";
import { signInPath } from "@/lib/routes";

const Signup = () => {
  return (
    <>
      <Breadcrumb title={"Signup"} pages={["Signup"]} />
      <section className="overflow-hidden bg-brand-cream/40 py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Create an Account
              </h2>
              <p>
                Production signup is handled by your OIDC provider. In local
                development, use sign in with your email to create a profile.
              </p>
            </div>

            <div className="flex flex-col gap-4 text-center">
              <Link
                href={signInPath}
                className="inline-flex justify-center rounded-lg bg-brand-ink px-6 py-3 font-medium text-white ease-out duration-200 hover:bg-brand-rust"
              >
                Continue to sign in
              </Link>
              <p className="text-sm text-brand-ink/70">
                Password recovery and social login are handled by the OIDC
                provider in production.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
