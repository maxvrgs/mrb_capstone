"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  // Estado para alternar entre perfil de Comprador y Vendedor
  const [activeRole, setActiveRole] = useState<"buyer" | "seller">("buyer");

  // Estados de datos personales
  const [firstName, setFirstName] = useState("Constanza");
  const [lastName, setLastName] = useState("Pérez");

  // Estados de dirección
  const [region, setRegion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [comuna, setComuna] = useState("");
  const [calle, setCalle] = useState("");
  const [observacion, setObservacion] = useState("");

  // Tiendas simuladas (Mock para desarrollo inicial)
  const [stores, setStores] = useState([
    {
      id: "1",
      name: "Taller Cerámica Creativa",
      image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&q=80",
      description: "Piezas de cerámica hechas a mano y subastas exclusivas de colecciones únicas.",
      stats: { sales: 24, earnings: 480000, inStock: 12, visits: 1350 },
      products: [
        { id: "p1", name: "Jarrón Rústico Arcilla", price: 25000, stock: 4 },
        { id: "p2", name: "Taza Esmaltada Turquesa", price: 12000, stock: 8 },
      ],
    },
  ]);

  // Formulario simple para crear tienda
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreDesc, setNewStoreDesc] = useState("");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Guardar datos en BD:", { firstName, lastName, region, ciudad, comuna, calle, observacion });
  };

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName) return;

    const newStore = {
      id: Date.now().toString(),
      name: newStoreName,
      image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&q=80",
      description: newStoreDesc || "Sin descripción",
      stats: { sales: 0, earnings: 0, inStock: 0, visits: 1 },
      products: [],
    };

    setStores([...stores, newStore]);
    setNewStoreName("");
    setNewStoreDesc("");
    setShowCreateStore(false);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Mi Cuenta</h1>
        <p className="text-sm text-slate-400">
          Administra tus datos personales, direcciones de despacho y tiendas activas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* COLUMNA IZQUIERDA: Selector de Rol / Modo */}
        <div className="space-y-4 md:col-span-1">
          <Card className="border-slate-800 bg-slate-50 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-neutral-800">Tipo de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={activeRole === "buyer" ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeRole === "buyer" ? "bg-brand-400 hover:bg-brand-600 text-white" : "text-slate-800 hover:bg-brand-800 hover:text-white"
                }`}
                onClick={() => setActiveRole("buyer")}
              >
                Perfil Comprador
              </Button>

              <Button
                variant={activeRole === "seller" ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeRole === "seller" ? "bg-brand-400 hover:bg-brand-600 text-white" : "text-slate-800 hover:bg-brand-800 hover:text-white"
                }`}
                onClick={() => setActiveRole("seller")}
              >
                Perfil Vendedor
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA: Contenido Principal */}
        <div className="space-y-6 md:col-span-3">
          {/* MODO COMPRADOR: Datos de Usuario y Dirección */}
          {activeRole === "buyer" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Información Personal */}
              <Card className="border-slate-800 bg-slate-50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800">Datos Personales</CardTitle>
                  <CardDescription className="text-slate-600">
                    Modifica tu información básica de contacto en la plataforma.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="border-slate-800 bg-slate-50 backdrop-blur text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="border-slate-800 bg-slate-50 backdrop-blur text-slate-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Dirección de Envío */}
              <Card className="border-slate-800 bg-slate-50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg text-bg-slate-700">Dirección de Despacho</CardTitle>
                  <CardDescription className="text-slate-400">
                    Utilizada para el cálculo de envíos y entregas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="region">Región</Label>
                      <Input
                        id="region"
                        placeholder="Metropolitana"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="border-slate-800 bg-slate-50 backdrop-blur text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ciudad">Ciudad</Label>
                      <Input
                        id="ciudad"
                        placeholder="Santiago"
                        value={ciudad}
                        onChange={(e) => setCiudad(e.target.value)}
                        className="border-slate-800 bg-slate-50 backdrop-blur text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comuna">Comuna</Label>
                      <Input
                        id="comuna"
                        placeholder="Providencia"
                        value={comuna}
                        onChange={(e) => setComuna(e.target.value)}
                        className="border-slate-800 bg-slate-50 backdrop-blur text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calle">Calle, Número y Depto</Label>
                    <Input
                      id="calle"
                      placeholder="Av. Providencia 1234, Depto 402"
                      value={calle}
                      onChange={(e) => setCalle(e.target.value)}
                      className="border-slate-800 bg-slate-50 backdrop-blur text-slate-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacion">Referencias</Label>
                    <Textarea
                      id="observacion"
                      placeholder="Dejar en conserjería, timbre no funciona, etc."
                      value={observacion}
                      onChange={(e) => setObservacion(e.target.value)}
                      className="border-slate-800 bg-slate-50 backdrop-blur text-slate-500"
                    />
                  </div>

                  <Button type="submit" className="bg-brand-600 hover:bg-brand-800 text-white">
                    Guardar Cambios
                  </Button>
                </CardContent>
              </Card>
            </form>
          )}

          {/* ´Perfil Vendedor */}
          {activeRole === "seller" && (
            <div className="space-y-6">
              {stores.length === 0 ? (
                <Card className="border-dashed border-slate-800 bg-slate-700/30 p-8 text-center">
                  <h3 className="text-lg font-semibold text-white">Aún no tienes tiendas creadas</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Comienza a vender o crear subastas creando tu primer espacio comercial.
                  </p>
                  <Button
                    onClick={() => setShowCreateStore(true)}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Crear Primera Tienda
                  </Button>
                </Card>
              ) : (
                <>
                  {stores.map((store) => (
                    <Card key={store.id} className="border-slate-800 bg-slate-50 backdrop-blur">
                      <CardHeader className="flex flex-row items-start gap-4">
                        <img
                          src={store.image}
                          alt={store.name}
                          className="h-16 w-16 rounded-lg object-cover border border-slate-800"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-xl text-slate-700">{store.name}</CardTitle>
                          <CardDescription className="text-slate-600 mt-1">
                            {store.description}
                          </CardDescription>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Mini Dashboard de Métricas */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-lg bg-slate-200 p-3 border border-slate-800/80">
                            <span className="text-xs text-slate-600">Ventas</span>
                            <p className="text-xl font-bold text-slate-700">{store.stats.sales}</p>
                          </div>
                          <div className="rounded-lg bg-slate-200 p-3 border border-slate-800/80">
                            <span className="text-xs text-slate-600">Ganancias</span>
                            <p className="text-xl font-bold text-emerald-400">
                              ${store.stats.earnings.toLocaleString("es-CL")}
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-200 p-3 border border-slate-800/80">
                            <span className="text-xs text-slate-600">En Stock</span>
                            <p className="text-xl font-bold text-slate-700">{store.stats.inStock}</p>
                          </div>
                          <div className="rounded-lg bg-slate-200 p-3 border border-slate-800/80">
                            <span className="text-xs text-slate-600">Visitas</span>
                            <p className="text-xl font-bold text-slate-700">{store.stats.visits}</p>
                          </div>
                        </div>

                        {/* Lista de Productos de la Tienda */}
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-3">
                            Productos Publicados ({store.products.length})
                          </h4>
                          {store.products.length === 0 ? (
                            <p className="text-xs text-slate-700 italic">No hay productos en esta tienda.</p>
                          ) : (
                            <div className="divide-y divide-slate-800 rounded-md border border-slate-800 bg-slate-200">
                              {store.products.map((prod) => (
                                <div key={prod.id} className="flex items-center justify-between p-3 text-sm">
                                  <span className="font-medium text-slate-700">{prod.name}</span>
                                  <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="border-slate-700 text-slate-600">
                                      Stock: {prod.stock}
                                    </Badge>
                                    <span className="font-semibold text-slate-700">
                                      ${prod.price.toLocaleString("es-CL")}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Botón para crear más tiendas al final de la lista */}
                  <div className="pt-2">
                    {!showCreateStore && (
                      <Button
                        onClick={() => setShowCreateStore(true)}
                        variant="outline"
                        className="w-full border-slate-800 text-slate-700 hover:bg-slate-300"
                      >
                        + Crear otra Tienda
                      </Button>
                    )}
                  </div>
                </>
              )}

              {/* Formulario Desplegable para Crear Tienda */}
              {showCreateStore && (
                <Card className="border-emerald-600/50 bg-slate-50">
                  <CardHeader>
                    <CardTitle className="text-base text-slate-700">Nueva Tienda</CardTitle>
                    <CardDescription className="text-slate-400">
                      Configura el nombre y la reseña de tu nuevo espacio comercial.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleCreateStore}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="storeName">Nombre de la Tienda</Label>
                        <Input
                          id="storeName"
                          placeholder="Ej: Joyería Artesanal Sol"
                          value={newStoreName}
                          onChange={(e) => setNewStoreName(e.target.value)}
                          className="border-slate-800 bg-slate-50 text-slate-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="storeDesc">Descripción</Label>
                        <Textarea
                          id="storeDesc"
                          placeholder="Describe lo que vendes o los remates que harás..."
                          value={newStoreDesc}
                          onChange={(e) => setNewStoreDesc(e.target.value)}
                          className="border-slate-800 bg-slate-50 text-slate-500"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowCreateStore(false)}
                          className="text-slate-600 border-slate-500"
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" className="bg-brand-600 hover:bg-brand-800 text-white">
                          Guardar Tienda
                        </Button>
                      </div>
                    </CardContent>
                  </form>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}