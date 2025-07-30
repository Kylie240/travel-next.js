import FiltersForm from "./filters-form";

export default function SearchPage () {
    return (
        <div className="min-h-screen bg-white py-8">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
                {/* Filters Bar */}
                <div className="flex flex-col mb-8">
                    <FiltersForm />
                </div>
            </div>
        </div>
    )
}