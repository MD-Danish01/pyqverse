export default function TestAttemptLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="min-h-screen bg-gray-50 text-gray-900 lg:h-screen lg:overflow-hidden">
			<div className="min-h-screen lg:h-full">{children}</div>
		</section>
	);
}

