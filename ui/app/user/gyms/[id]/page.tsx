import GymDetailsClient from './GymDetailsClient';

// Required for static export with dynamic routes
export async function generateStaticParams() {
    return [{ id: 'static-build-placeholder' }];
}

export default function GymDetailsPage({ params }: { params: { id: string } }) {
    return <GymDetailsClient />;
}
