import { getItineraryForPdfExport } from "@/lib/actions/itinerary.actions";
import { buildItineraryJsPdfFromData } from "@/lib/utils/itinerary-pdf-document";

export {
  buildItineraryJsPdfFromData,
  itineraryDataToPdfBuffer,
} from "@/lib/utils/itinerary-pdf-document";

export const exportItineraryToPDF = async (itineraryId: string) => {
  try {
    const itinerary = (await getItineraryForPdfExport(itineraryId)) as any;

    if (!itinerary) {
      throw new Error("Itinerary not found");
    }

    const doc = await buildItineraryJsPdfFromData(itinerary);
    const fileName = `${itinerary.title || "itinerary"}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);

    return { success: true };
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw error;
  }
};
