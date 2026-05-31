export default function TestAttemptLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="h-screen overflow-hidden bg-gray-50 text-gray-900">
			<div className="h-full">{children}</div>
		</section>
	);
}

