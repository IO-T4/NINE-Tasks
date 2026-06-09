import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NINE Tasks',
    short_name: 'NINE',
    description: 'Gestor de tareas y productividad extrema',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#4F46E5', // Color principal de NINE Tasks
    icons: [
      {
        src: '/icon-512.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
