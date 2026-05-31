import React from 'react';

export type AreaName =
    | 'Pool de Sanción'
    | 'Informática'
    | 'Traductores'
    | 'Mesa de Partes'
    | 'Equipo Multidisciplinario'
    | 'Notificadores'
    | 'Pool de Traducción';

interface UserBadgeProps {
    name: string;
    area: AreaName;
}

const areaStyles: Record<AreaName, { suffix: string; color: string }> = {
    'Pool de Sanción': { suffix: '_PS', color: 'text-blue-600 font-bold' },
    'Informática': { suffix: '_INF', color: 'text-green-600 font-bold' },
    'Traductores': { suffix: '_TRAD', color: 'text-purple-600 font-bold' },
    'Mesa de Partes': { suffix: '_MP', color: 'text-orange-600 font-bold' },
    'Equipo Multidisciplinario': { suffix: '_EM', color: 'text-teal-600 font-bold' },
    'Notificadores': { suffix: '_NOT', color: 'text-amber-500 font-bold' },
    'Pool de Traducción': { suffix: '_PTRAD', color: 'text-indigo-600 font-bold' },
};

export default function UserBadge({ name, area }: UserBadgeProps) {
    const config = areaStyles[area] || { suffix: '', color: 'text-gray-600' };

    return (
        <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900 hover:underline cursor-pointer">{name}</span>
            <span className={`text-xs px-1.5 py-0.5 bg-gray-100 rounded ${config.color}`}>
                {config.suffix}
            </span>
        </div>
    );
}