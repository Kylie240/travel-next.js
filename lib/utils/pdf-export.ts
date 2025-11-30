import jsPDF from 'jspdf';
import { getItineraryById } from '@/lib/actions/itinerary.actions';
import { formatDateToText } from './date';
import { itineraryTagsMap } from '@/lib/constants/tags';

export const exportItineraryToPDF = async (itineraryId: string) => {
  try {
    // Fetch the full itinerary data
    const itinerary = await getItineraryById(itineraryId) as any;
    
    if (!itinerary) {
      throw new Error('Itinerary not found');
    }

    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number, isBold: boolean = false, color: string = '#000000') => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(color);
      
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        checkPageBreak(8);
        doc.text(line, margin, yPosition);
        yPosition += 7;
      });
    };

    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#000000');
    const titleLines = doc.splitTextToSize(itinerary.title || 'Untitled Itinerary', maxWidth);
    titleLines.forEach((line: string) => {
      checkPageBreak(10);
      doc.text(line, margin, yPosition);
      yPosition += 10;
    });
    yPosition += 5;

    // Short Description
    if (itinerary.shortDescription) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#666666');
      const descLines = doc.splitTextToSize(itinerary.shortDescription, maxWidth);
      descLines.forEach((line: string) => {
        checkPageBreak(7);
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }

    // Detailed Overview
    if (itinerary.detailedOverview) {
      yPosition += 5;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#000000');
      doc.text('Overview', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#333333');
      const overviewLines = doc.splitTextToSize(itinerary.detailedOverview, maxWidth);
      overviewLines.forEach((line: string) => {
        checkPageBreak(7);
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }

    // Trip Details
    yPosition += 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#000000');
    doc.text('Trip Details', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#333333');
    
    if (itinerary.duration) {
      doc.text(`Duration: ${itinerary.duration} ${itinerary.duration === 1 ? 'day' : 'days'}`, margin, yPosition);
      yPosition += 7;
    }

    if (itinerary.countries && itinerary.countries.length > 0) {
      doc.text(`Countries: ${itinerary.countries.join(', ')}`, margin, yPosition);
      yPosition += 7;
    }

    if (itinerary.cities && itinerary.cities.length > 0) {
      const cityNames = itinerary.cities.map((c: any) => `${c.city}, ${c.country}`).join('; ');
      doc.text(`Cities: ${cityNames}`, margin, yPosition);
      yPosition += 7;
    }

    if (itinerary.budget) {
      doc.text(`Estimated Budget: $${itinerary.budget.toLocaleString()}`, margin, yPosition);
      yPosition += 7;
    }

    // Tags
    if (itinerary.itineraryTags && itinerary.itineraryTags.length > 0) {
      const tagNames = itinerary.itineraryTags
        .map((tagId: number) => itineraryTagsMap.find(t => t.id === tagId)?.name)
        .filter(Boolean)
        .join(', ');
      if (tagNames) {
        doc.text(`Categories: ${tagNames}`, margin, yPosition);
        yPosition += 7;
      }
    }

    yPosition += 5;

    // Days
    if (itinerary.days && itinerary.days.length > 0) {
      yPosition += 5;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#000000');
      doc.text('Itinerary', margin, yPosition);
      yPosition += 10;

      itinerary.days.forEach((day: any, index: number) => {
        checkPageBreak(30);
        
        // Day Header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#000000');
        const dayTitle = day.title || `Day ${index + 1}`;
        doc.text(dayTitle, margin, yPosition);
        yPosition += 8;

        // Date
        if (day.date) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor('#666666');
          const formattedDate = formatDateToText(day.date);
          doc.text(formattedDate, margin, yPosition);
          yPosition += 6;
        }

        // Location
        if (day.cityName || day.countryName) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor('#333333');
          const location = [day.cityName, day.provinceName, day.countryName].filter(Boolean).join(', ');
          doc.text(`📍 ${location}`, margin, yPosition);
          yPosition += 6;
        }

        // Description
        if (day.description) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor('#333333');
          const descLines = doc.splitTextToSize(day.description, maxWidth);
          descLines.forEach((line: string) => {
            checkPageBreak(6);
            doc.text(line, margin, yPosition);
            yPosition += 5;
          });
          yPosition += 3;
        }

        // Activities
        if (day.activities && day.activities.length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor('#000000');
          doc.text('Activities:', margin, yPosition);
          yPosition += 7;

          day.activities.forEach((activity: any) => {
            checkPageBreak(15);
            
            // Activity Title
            if (activity.title) {
              doc.setFontSize(10);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor('#000000');
              const activityTitle = activity.time 
                ? `[${activity.time.substring(0, 5)}] ${activity.title}`
                : activity.title;
              const titleLines = doc.splitTextToSize(activityTitle, maxWidth - 10);
              titleLines.forEach((line: string) => {
                checkPageBreak(6);
                doc.text(line, margin + 5, yPosition);
                yPosition += 5;
              });
            }

            // Activity Description
            if (activity.description) {
              doc.setFontSize(9);
              doc.setFont('helvetica', 'normal');
              doc.setTextColor('#555555');
              const activityDescLines = doc.splitTextToSize(activity.description, maxWidth - 10);
              activityDescLines.forEach((line: string) => {
                checkPageBreak(5);
                doc.text(line, margin + 5, yPosition);
                yPosition += 4;
              });
            }

            // Activity Location
            if (activity.location) {
              doc.setFontSize(9);
              doc.setFont('helvetica', 'italic');
              doc.setTextColor('#666666');
              doc.text(`📍 ${activity.location}`, margin + 5, yPosition);
              yPosition += 5;
            }

            yPosition += 3;
          });
        }

        // Accommodation
        if (day.showAccommodation && day.accommodation && day.accommodation.name) {
          checkPageBreak(10);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor('#000000');
          doc.text('Accommodation:', margin, yPosition);
          yPosition += 6;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor('#333333');
          if (day.accommodation.name) {
            doc.text(day.accommodation.name, margin + 5, yPosition);
            yPosition += 5;
          }
          if (day.accommodation.type) {
            doc.text(`Type: ${day.accommodation.type}`, margin + 5, yPosition);
            yPosition += 5;
          }
          if (day.accommodation.location) {
            doc.text(`Location: ${day.accommodation.location}`, margin + 5, yPosition);
            yPosition += 5;
          }
        }

        yPosition += 8;
      });
    }

    // Notes
    if (itinerary.notes && itinerary.notes.length > 0) {
      checkPageBreak(20);
      yPosition += 5;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#000000');
      doc.text('Notes', margin, yPosition);
      yPosition += 8;

      itinerary.notes.forEach((note: any) => {
        checkPageBreak(15);
        
        if (note.title) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor('#000000');
          const noteTitleLines = doc.splitTextToSize(note.title, maxWidth);
          noteTitleLines.forEach((line: string) => {
            checkPageBreak(6);
            doc.text(line, margin, yPosition);
            yPosition += 6;
          });
        }

        if (note.content) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor('#333333');
          const noteContentLines = doc.splitTextToSize(note.content, maxWidth);
          noteContentLines.forEach((line: string) => {
            checkPageBreak(5);
            doc.text(line, margin, yPosition);
            yPosition += 5;
          });
        }

        yPosition += 5;
      });
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#999999');
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    const fileName = `${itinerary.title || 'itinerary'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return { success: true };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};

