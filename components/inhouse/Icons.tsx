// 게시판에서 쓰는 작은 선 아이콘
type P = { size?: number; title?: string };

const svg = (size: number, title: string | undefined, children: React.ReactNode) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={title ? undefined : true}
    role={title ? "img" : undefined}
    style={{ flex: "none", verticalAlign: "-2px" }}
  >
    {title && <title>{title}</title>}
    {children}
  </svg>
);

export const EyeIcon = ({ size = 14, title }: P) =>
  svg(
    size,
    title,
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>,
  );

export const CommentIcon = ({ size = 14, title }: P) => svg(size, title, <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12Z" />);

export const HeartIcon = ({ size = 14, title }: P) =>
  svg(size, title, <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />);

export const PinIcon = ({ size = 14, title }: P) =>
  svg(
    size,
    title,
    <>
      <path d="M9 3h6l-1 6 4 4H6l4-4-1-6Z" fill="currentColor" />
      <path d="M12 13v8" />
    </>,
  );

export const ImageIcon = ({ size = 14, title }: P) =>
  svg(
    size,
    title,
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m21 16-5-5-9 9" />
    </>,
  );
