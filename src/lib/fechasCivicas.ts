export interface FechaCivica {
    dia: number;
    mes: number; // 1 = Enero, 12 = Diciembre
    titulo: string;
    tipo: 'Nacional' | 'Internacional' | 'Institucional';
    icono: string;
}

export const FECHAS_CIVICAS: FechaCivica[] = [
    { dia: 1, mes: 5, titulo: "Día Internacional del Trabajo", tipo: "Internacional", icono: "🛠️" },
    { dia: 7, mes: 6, titulo: "Día de la Bandera y la Batalla de Arica", tipo: "Nacional", icono: "🇵🇪" },
    { dia: 24, mes: 6, titulo: "Día del Campesino", tipo: "Nacional", icono: "🚜" },
    { dia: 29, mes: 6, titulo: "Día de San Pedro y San Pablo", tipo: "Nacional", icono: "⚓" },
    { dia: 28, mes: 7, titulo: "Día de la Independencia del Perú (Fiestas Patrias)", tipo: "Nacional", icono: "🇵🇪" },
    { dia: 29, mes: 7, titulo: "Gran Parada Militar", tipo: "Nacional", icono: "🎖️" },
    { dia: 4, mes: 8, titulo: "Día del Juez y de la Jueza en el Perú", tipo: "Institucional", icono: "⚖️" },
    { dia: 30, mes: 8, titulo: "Día de Santa Rosa de Lima", tipo: "Nacional", icono: "🌹" },
    { dia: 24, mes: 9, titulo: "Día de las Fuerzas Armadas del Perú", tipo: "Nacional", icono: "🎖️" },
    { dia: 8, mes: 10, titulo: "Combate de Angamos", tipo: "Nacional", icono: "🚢" },
    { dia: 1, mes: 11, titulo: "Día de Todos los Santos", tipo: "Nacional", icono: "🕊️" },
    { dia: 5, mes: 11, titulo: "Día del Trabajador Judicial en el Perú", tipo: "Institucional", icono: "⚖️" },
    { dia: 8, mes: 12, titulo: "Día de la Inmaculada Concepción", tipo: "Nacional", icono: "✨" },
    { dia: 9, mes: 12, titulo: "Batalla de Ayacucho", tipo: "Nacional", icono: "⚔️" },
    { dia: 10, mes: 12, titulo: "Día Internacional de los Derechos Humanos", tipo: "Internacional", icono: "🌍" },
    { dia: 25, mes: 12, titulo: "Navidad", tipo: "Internacional", icono: "🎄" }
];