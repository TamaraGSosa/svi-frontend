import React from "react";
import { PlaceholderPage } from "./PlaceholderPage";

export const DashboardPage: React.FC = () => (
  <PlaceholderPage
    title="Dashboard de Videovigilancia"
    description="Resumen de estado de cámaras, métricas y actividad reciente del sistema."
    pageTitle="Dashboard"
  />
);

export const MonitoringPage: React.FC = () => (
  <PlaceholderPage
    title="Monitoreo de Cámaras"
    description="Cuadrícula de transmisiones en vivo y monitoreo de cámaras de videovigilancia."
    pageTitle="Monitoreo en Vivo"
  />
);

export const CameraDetailPage: React.FC = () => (
  <PlaceholderPage
    title="Detalle de Cámara"
    description="Visualización individual, configuración y estado de la cámara seleccionada."
    pageTitle="Detalle de Cámara"
  />
);

export const VideosPage: React.FC = () => (
  <PlaceholderPage
    title="Videos Grabados"
    description="Listado de grabaciones y almacenamiento de video del sistema."
    pageTitle="Videos Grabados"
  />
);

export const VideoDetailPage: React.FC = () => (
  <PlaceholderPage
    title="Detalle y Análisis de Video"
    description="Reproducción, segmentación y análisis de video grabado."
    pageTitle="Análisis de Video"
  />
);

export const DetectionsPage: React.FC = () => (
  <PlaceholderPage
    title="Listado de Detecciones"
    description="Registro y filtrado de detecciones y alertas generadas por el sistema."
    pageTitle="Detecciones"
  />
);

export const EventDetailPage: React.FC = () => (
  <PlaceholderPage
    title="Revisión de Evento"
    description="Detalle, evidencia y acciones tomadas sobre el evento seleccionado."
    pageTitle="Revisión de Evento"
  />
);

export const SettingsPage: React.FC = () => (
  <PlaceholderPage
    title="Configuración del Sistema"
    description="Ajustes de parámetros generales, dispositivos y preferencias del sistema."
    pageTitle="Configuración"
  />
);

