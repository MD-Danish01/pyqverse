declare module "react-katex" {
  import type { ComponentPropsWithoutRef, ReactElement } from "react";

  export type InlineMathProps = {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => ReactElement;
  } & ComponentPropsWithoutRef<"span">;

  export type BlockMathProps = {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => ReactElement;
  } & ComponentPropsWithoutRef<"div">;

  export const InlineMath: (props: InlineMathProps) => ReactElement;
  export const BlockMath: (props: BlockMathProps) => ReactElement;
}
