import React from "react";
import { Testimonial } from "@/types/testimonial";
import Image from "next/image";

const SingleItem = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="m-1 rounded-[10px] bg-[#F9F5F0] px-4 py-7.5 shadow-testimonial sm:px-8.5">
      <div className="mb-5 flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Image
            key={index}
            src="/images/icons/icon-star.svg"
            alt="star icon"
            width={15}
            height={15}
            style={{
              filter:
                "sepia(1) saturate(2.5) hue-rotate(18deg) brightness(1.05)",
            }}
          />
        ))}
      </div>

      <p className="mb-6 text-brand-ink/80">{testimonial.review}</p>

      <a href="#" className="flex items-center gap-4">
        <div className="h-12.5 w-12.5 overflow-hidden rounded-full">
          <Image
            src={testimonial.authorImg}
            alt="author"
            className="h-12.5 w-12.5 overflow-hidden rounded-full"
            width={50}
            height={50}
          />
        </div>

        <div>
          <h3 className="font-medium text-brand-ink">{testimonial.authorName}</h3>
          <p className="text-custom-sm text-brand-ink/65">{testimonial.authorRole}</p>
        </div>
      </a>
    </div>
  );
};

export default SingleItem;
