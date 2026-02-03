import { servicesData } from "@/data/services";

export default function TestSlugs() {
    return (
        <div className="p-10 bg-black text-white">
            <h1 className="text-2xl mb-4">Debug: Service Slugs</h1>
            <pre className="bg-gray-800 p-4 rounded text-sm">
                {JSON.stringify(servicesData.map(s => ({ title: s.title, slug: s.slug })), null, 2)}
            </pre>
            <div className="mt-8 space-y-2">
                <h2 className="text-xl">Generated Links:</h2>
                {servicesData.map(s => (
                    <div key={s.slug}>
                        <a href={`/servicios/${s.slug}`} className="text-blue-400 underline">
                            {`/servicios/${s.slug}`}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
