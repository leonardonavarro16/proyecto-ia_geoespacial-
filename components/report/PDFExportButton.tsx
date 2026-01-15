'use client';

import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf'; 

interface AnalysisReport {
  resumen: string;
  analisisMediaoambiental: {
    calidadAire: string;
    clima: string;
    recomendacion: string;
  };
  infraestructura: {
    servicios: string[];
    analisis: string;
  };
  riesgos: {
    inundabilidad: string;
    satelital: string;
    nivelRiesgo: 'Bajo' | 'Moderado' | 'Alto' | 'Crítico';
  };
  conclusion: string;
  recomendacionFinal: string;
  enlaces: {
    ign: string;
    copernicus: string;
    osm: string;
  };
}

interface PDFExportProps {
  report: AnalysisReport | null;
}

export default function PDFExportButton({ report }: PDFExportProps) {
  const handleDownload = () => {
    if (!report) {
      alert('No hay informes para descargar aún.');
      return;
    }

    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 30;

    // Header Background
    doc.setFillColor(37, 99, 235); // Blue primary
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('INFORME GEOESPACIAL PROFESIONAL', margin, 25);
    
    // Metadata
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleString()}`, margin, 35);
    
    y = 55;

    // Help function to add sections
    const addSection = (title: string, content: string | string[]) => {
      if (y > 250) {
        doc.addPage();
        y = 30;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(37, 99, 235);
      doc.text(title, margin, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);

      const items = Array.isArray(content) ? content : [content];
      items.forEach(item => {
        const lines = doc.splitTextToSize(item, pageWidth - (margin * 2));
        lines.forEach((line: string) => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, margin, y);
          y += 6;
        });
      });
      y += 5;
    };

    addSection('1. RESUMEN EJECUTIVO', report.resumen);
    
    addSection('2. ANÁLISIS MEDIOAMBIENTAL', [
      `Calidad del Aire: ${report.analisisMediaoambiental.calidadAire}`,
      `Clima: ${report.analisisMediaoambiental.clima}`,
      `Recomendación: ${report.analisisMediaoambiental.recomendacion}`
    ]);

    addSection('3. INFRAESTRUCTURA Y SERVICIOS', [
      ...report.infraestructura.servicios.map(s => `• ${s}`),
      `Análisis: ${report.infraestructura.analisis}`
    ]);

    addSection(`4. EVALUACIÓN DE RIESGOS (NIVEL: ${report.riesgos.nivelRiesgo.toUpperCase()})`, [
      `Riesgo Inundación: ${report.riesgos.inundabilidad}`,
      `Análisis Satelital: ${report.riesgos.satelital}`
    ]);

    addSection('5. CONCLUSIÓN TÉCNICA', report.conclusion);
    
    addSection('6. RECOMENDACIÓN FINAL', report.recomendacionFinal);

    // Footer
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount} - Geospatial Intelligence System`, pageWidth / 2, 290, { align: 'center' });
    }

    doc.save(`informe_geoespacial_${Date.now()}.pdf`);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} title="Descargar Informe PDF">
      <FileDown className="h-4 w-4 mr-2" />
      PDF
    </Button>
  );
}
