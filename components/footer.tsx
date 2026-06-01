const CONTAINER = "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8";

function LogoMark({ size = "md" }: { size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-6 w-6" : "h-7 w-7";
  const txt = size === "sm" ? "text-[10px]" : "text-xs";
  return (
    <div
      className={`${dim} rounded bg-amber-600 flex items-center justify-center flex-shrink-0`}
      aria-hidden="true"
    >
      <span className={`text-white font-bold ${txt} leading-none`}>PV</span>
    </div>
  );
}
const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8">
      <div className={CONTAINER}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LogoMark size="sm" />
            <span className="font-semibold text-slate-900 text-sm">
              PyqVerse
            </span>
          </div>
          <p className="text-xs text-slate-400 text-center">
            &copy; {new Date().getFullYear()} PyqVerse &mdash; Built for exam
            preparation and learning.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
