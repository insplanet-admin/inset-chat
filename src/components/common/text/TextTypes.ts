import tokens from "../../../utils/tokens";

const fontSizeToken = tokens["2.-semantic-tokens"].dark.scale.type;
/** 1px -0.25px -1px */
const letterSpacingToken = tokens["1.-primitives"].typography["letter-spacing"];

export const textVariants = {
  // display Text
  displayLg: {
    fontSize: fontSizeToken.display.large.value,
    lineHeight: 1.25,
    letterSpacing: letterSpacingToken["tight-1"].value,
  },
  displayMd: {
    fontSize: fontSizeToken.display.medium.value,
    lineHeight: 1.25,
    letterSpacing: letterSpacingToken["tight-2"].value,
  },
  displaySm: {
    fontSize: fontSizeToken.display.small.value,
    lineHeight: 1.25,
    letterSpacing: letterSpacingToken["tight-1"].value,
  },

  // heading Text
  headingXl: {
    fontSize: fontSizeToken.heading.xlarge.value,
    lineHeight: 1.3,
    letterSpacing: letterSpacingToken["tight-1"].value,
  },
  headingLg: {
    fontSize: fontSizeToken.heading.large.value,
    lineHeight: 1.3,
    letterSpacing: letterSpacingToken["tight-1"].value,
  },
  headingMd: {
    fontSize: fontSizeToken.heading.medium.value,
    lineHeight: 1.35,
    letterSpacing: letterSpacingToken["tight-1"].value,
  },
  headingSm: {
    fontSize: fontSizeToken.heading.small.value,
    lineHeight: 1.25,
    letterSpacing: letterSpacingToken["tight-1"].value,
  },
  headingXs: {
    fontSize: fontSizeToken.heading.xsmall.value,
    lineHeight: 1.25,
    letterSpacing: letterSpacingToken["tight-1"].value,
  },

  // body Text
  bodyLg: {
    fontSize: fontSizeToken.body.large.value,
    lineHeight: 1.6,
    letterSpacing: "0px",
  },
  bodyMd: {
    fontSize: fontSizeToken.body.medium.value,
    lineHeight: 1.7,
    letterSpacing: "0px",
  },
  bodySm: {
    fontSize: fontSizeToken.body.small.value,
    lineHeight: 1.7,
    letterSpacing: "0px",
  },

  // button Text
  // letterSpacing : 0

  // Button Text는 text 토큰이 없습니다.
  // 우선 제외하겠습니다.

  // label Text
  labelLg: {
    fontSize: fontSizeToken.label.large.value,
    lineHeight: 1.25,
    letterSpacing: "0px",
  },
  labelMd: {
    fontSize: fontSizeToken.label.medium.value,
    lineHeight: 1.3,
    letterSpacing: "0px",
  },
  labelSm: {
    fontSize: fontSizeToken.label.small.value,
    lineHeight: 1.3,
    letterSpacing: "0px",
  },

  // caption Text
  captionLg: {
    fontSize: fontSizeToken.caption.large.value,
    lineHeight: 1.3,
    letterSpacing: "0px",
  },
  captionMd: {
    fontSize: fontSizeToken.caption.medium.value,
    lineHeight: 1.3,
    letterSpacing: "0px",
  },
  captionSm: {
    fontSize: fontSizeToken.caption.small.value,
    lineHeight: 1.25,
    letterSpacing: "0px",
  },
} as const;

export type TextElementType =
  | "dt"
  | "dd"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "strong"
  | "legend";

export type FontWeight = "regular" | "medium" | "semibold" | "bold";
export type TextVariants = keyof typeof textVariants;
