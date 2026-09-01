import { Button } from "primereact/button";

const App = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-600">PixelWorks</h1>
      <p>Proyecto configurado correctamente.</p>

      <Button
        label="Probar"
        icon="pi pi-check"
        className="bg-red-500"
      />
    </div>
  );
}

export default App;