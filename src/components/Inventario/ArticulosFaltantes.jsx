import React, { useState, useEffect, useContext } from "react";
import DataTable, { createTheme } from "react-data-table-component";
import Select from "react-select";
import { Counter } from "../../Utils/Counter";
import { ServicesContext } from "../../context/ServicesContext";
import { set } from "date-fns";
import { use } from "react";

function ArticulosFaltantes() {
  // ———✱ Extraemos del contexto exactamente lo que definimos en ServicesContext:
  const { counts } = useContext(ServicesContext);

  const [articulos, setArticulos] = useState([]);
  const [articulosSeleccionados, setArticulosSeleccionados] = useState([]);
  const [PrecioJusto,setPrecioJusto] = useState([]);
 const [PrecioTotalCantidad,setPrecioTotalCantidad] = useState(0);
  console.log("Estos son los articulos seleccionados:", articulosSeleccionados);

  const FECH_API_ARTICULOS = "https://localhost:7184/api/Service/Articulos";

  useEffect(() => {
    const tokenRecibido = localStorage.getItem("token");
    const fetchArticulos = async () => {
      try {
        const response = await fetch(FECH_API_ARTICULOS, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenRecibido}`,
          },
        });
        if (!response.ok) {
          throw new Error("Error al obtener los articulos");
        }
        const data = await response.json();

        const dataArticulosSelect = data.map((item) => ({
          value: item.idArticulo,
          label: item.nombreArticulo,
          precio: item.precio,
        }));
        setArticulos(dataArticulosSelect);
        console.log("Estos son los articulos todos:", data);
      } catch (error) {
        console.error("Error al obtener los artículos:", error);
      }
    };
    if (tokenRecibido) {
      fetchArticulos();
    }
  }, []);

  createTheme("custom", {
    text: {
      primary: "#2c3e50",
      secondary: "#7f8c8d",
    },
    background: {
      default: "#f8f9fa",
    },
    context: {
      background: "#d6f3ff",
      text: "#2c3e50",
    },
    divider: {
      default: "#e0e0e0",
    },
    action: {
      button: "#3498db",
      hover: "#2980b9",
      disabled: "#bdc3c7",
    },
    highlight: {
      primary: "#e74c3c",
      secondary: "#2ecc71",
    },
  });

  const columns = [
    {
      name: "IdArticulo",
      selector: (row) => row.value,
      sortable: true,
    },
    {
      name: "NombreArticulo",
      selector: (row) => row.label,
      sortable: true,
    },
    {
      name: "Cantidad",
      // ———✱ Le pasamos id para que Counter lo use:
      cell: (row) => <Counter id={row.value} />,
    },
    {
      name: "Precio Unitario",
      selector: (row) => row.precio,
      sortable: true,
    },
    {
      name: "PrecioTotal",
      // ———✱ Para cada fila, sacamos de counts la cantidad específica:
      selector: (row) => {
        const cantidad = counts[row.value] || 1;
        
        return row.precio * cantidad;
      },
      sortable: true,
    },
      
    {
      name: "Acciones",
      cell: (row) => (
        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-sm btn-primary me-1"
            onClick={() =>
              setArticulosSeleccionados(
                articulosSeleccionados.filter(
                  (articulo) => articulo.value !== row.value
                )
              )
            }
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];
useEffect(() => {
  const precioTotal=articulosSeleccionados.map((row)=> {
    const cantidad =counts[row.value] || 1;
    return row.precio * cantidad;
  });
  setPrecioJusto(precioTotal);
}, [articulosSeleccionados, counts]);
useEffect(() => {
 setPrecioTotalCantidad(PrecioJusto.reduce((acc,item)=>acc+item,0));
    console.log("Estos son los precios total CANTIDAD:", PrecioTotalCantidad);
}, [PrecioJusto]);




  return (
    <div className="card shadow-sm mt-1 col-md-10 mx-auto p-3 mt-5">
      <h4 className="mb-2 d-flex justify-content-center">Lista de Servicios</h4>

      <Select
        className="bg-white"
        options={articulos}
        value={articulosSeleccionados}
        onChange={(selectedOption) => setArticulosSeleccionados(selectedOption)}
        placeholder="Elige..."
        isSearchable
        isMulti
        noOptionsMessage={() => "No hay opciones"}
        styles={{
          control: (base) => ({
            ...base,
            border: "2px solid #4a90e2",
            backgroundColor: "#fff",
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: "#fff",
            opacity: 1,
            zIndex: 100,
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? "#f0f8ff" : "#fff",
            color: "#000",
          }),
        }}
      />

      <DataTable
        columns={columns}
        data={articulosSeleccionados}
        pagination
        highlightOnHover
        striped
        theme="custom"
        noDataComponent={
          <div className="text-center m-2">
            <p>No hay pedidos disponibles</p>
          </div>
        }
      />
          <div className="d-flex justify-content-end">
        <h5 className="text-end me-3"> Precio Total: {PrecioTotalCantidad} GS.</h5>
    </div>
      
    </div>

  );
}

export default ArticulosFaltantes;
