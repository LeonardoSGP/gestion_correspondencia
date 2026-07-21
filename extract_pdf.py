import pdfplumber
import sys

pdf_path = r"C:\Users\leosg\OneDrive\Escritorio\Leonardo\UNI\9to semestre\Enfoque Agil\Iteracion1_ListaMaestraHU_TarjetasCRC_SistemaCorrespondencia.pdf"
output_path = r"c:\Users\leosg\gestion_correspondencia\pdf_content.txt"

with pdfplumber.open(pdf_path) as pdf:
    with open(output_path, "w", encoding="utf-8") as out:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                out.write(f"\n--- PAGINA {i+1} ---\n")
                out.write(text)
                out.write("\n")
            
            # Also extract tables
            tables = page.extract_tables()
            if tables:
                for j, table in enumerate(tables):
                    out.write(f"\n[TABLA {j+1} - Pagina {i+1}]\n")
                    for row in table:
                        cleaned = [str(cell).strip() if cell else "" for cell in row]
                        out.write(" | ".join(cleaned) + "\n")

print(f"Extracted {len(pdf.pages)} pages to {output_path}")
