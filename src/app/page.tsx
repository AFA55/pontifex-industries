export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Pontifex Header */}
        <div className="bg-gradient-to-r from-pontifex-blue-900 to-teal-600 text-white p-8 rounded-xl mb-8">
          <h1 className="text-4xl font-bold mb-2">🏗️ Pontifex Industries</h1>
          <p className="text-xl">Construction Asset Management Platform</p>
          <p className="text-lg opacity-90">The Hilti ON!Track Killer</p>
        </div>

        {/* Color Test Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-pontifex bg-pontifex-blue-900 text-white min-touch">
            <h3 className="font-semibold">Royal Blue</h3>
            <p className="text-sm">Primary Brand</p>
          </div>
          <div className="card-pontifex bg-teal-600 text-white min-touch">
            <h3 className="font-semibold">Enterprise Teal</h3>
            <p className="text-sm">Professional Accent</p>
          </div>
          <div className="card-pontifex">
            <span className="status-available">Available</span>
          </div>
          <div className="card-pontifex">
            <span className="status-maintenance">Maintenance</span>
          </div>
        </div>

        {/* Button Test */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="btn-pontifex">
            Primary Action
          </button>
          <button className="btn-pontifex-teal">
            Secondary Action
          </button>
        </div>

        {/* Input Test */}
        <div className="card-pontifex max-w-md">
          <h3 className="text-construction mb-4">Input Test</h3>
          <input 
            type="text" 
            placeholder="Scan Asset ID..." 
            className="input-pontifex w-full"
          />
        </div>

        {/* Status */}
        <div className="card-pontifex mt-8">
          <h2 className="text-2xl font-bold text-pontifex-blue-900 mb-4">
            🚀 Enterprise Foundation Complete!
          </h2>
          <p className="text-construction">
            Professional Pontifex Industries enterprise branding system active. 
            Ready for authentication development.
          </p>
        </div>
      </div>
    </main>
  )
}