"use client";

import { use } from "react";
import CotizacionForm from "@/components/cotizaciones/CotizacionForm";

export default function EditCotizacionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <CotizacionForm cotizacionId={id} />;
}
