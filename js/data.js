export const initialNews = [
  { category: "ACTUALIDAD", title: "Una nueva iniciativa para la comunidad", description: "Conoce esta propuesta y cómo busca generar nuevas oportunidades de participación estudiantil.", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=560&h=320&q=80", alt: "Campus universitario y estudiantes", link: "https://medellin.unal.edu.co/" },
  { category: "INVESTIGACIÓN", title: "Ideas que transforman nuestro entorno", description: "Exploramos proyectos de ingeniería que conectan el conocimiento con los retos actuales.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=560&h=320&q=80", alt: "Laboratorio de investigación e ingeniería", link: "https://medellin.unal.edu.co/" },
  { category: "VIDA UNIVERSITARIA", title: "Espacios para aprender y compartir", description: "Participa en experiencias académicas y culturales que fortalecen los vínculos de nuestra facultad.", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=560&h=320&q=80", alt: "Grupo de estudiantes colaborando", link: "https://medellin.unal.edu.co/" },
  { category: "OPORTUNIDADES", title: "Nuevas oportunidades para crecer", description: "Entérate de las becas, semilleros y convocatorias vigentes que pueden interesarte.", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=560&h=320&q=80", alt: "Conferencia y oportunidades académicas", link: "https://medellin.unal.edu.co/" }
];

export const initialEvents = [
  ["NOV", "05", "Charla académica"], ["NOV", "08", "Taller práctico"],
  ["NOV", "12", "Encuentro cultural"], ["NOV", "14", "Seminario"],
  ["NOV", "18", "Feria universitaria"], ["NOV", "20", "Conversatorio"],
  ["NOV", "25", "Muestra de proyectos"], ["NOV", "28", "Cierre de actividades"]
].map(([month, day, title]) => ({ month, day, title }));
