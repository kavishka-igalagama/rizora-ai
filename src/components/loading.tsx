"use client";

import { Leaf } from "lucide-react";

const Loading = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background/60 backdrop-blur-sm">
      <div className="relative flex flex-col items-center">
        <div className="absolute h-28 w-28 animate-ping rounded-full border border-primary/20" />
        <div className="absolute h-36 w-36 animate-pulse rounded-full border border-emerald-500/10" />

        <div className="relative flex h-20 w-20 animate-[float_2.5s_ease-in-out_infinite] items-center justify-center rounded-4xl bg-linear-to-br from-primary to-emerald-600 shadow-2xl">
          <Leaf className="h-10 w-10 animate-pulse text-primary-foreground" />
        </div>

        <p className="mt-5 text-sm text-muted-foreground">Loading ...</p>

        <div className="mt-3 h-1.5 w-24 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-[loadingBar_1.4s_ease-in-out_infinite] rounded-full bg-linear-to-r from-primary to-emerald-500" />
        </div>
      </div>

      <style jsx>{`
        @keyframes loadingBar {
          0% {
            transform: translateX(-100%);
            width: 40%;
          }
          50% {
            transform: translateX(60%);
            width: 55%;
          }
          100% {
            transform: translateX(220%);
            width: 40%;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;
