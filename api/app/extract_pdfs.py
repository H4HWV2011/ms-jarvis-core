import os
import PyPDF2

pdf_folder = "./contracts"
output_file = "mountainshares_kb.txt"

with open(output_file, "w", encoding="utf-8") as out:
    for fname in os.listdir(pdf_folder):
        if fname.lower().endswith('.pdf'):
            full_path = os.path.join(pdf_folder, fname)
            try:
                pdf = PyPDF2.PdfReader(full_path)
                out.write(f"\n=== {fname} ===\n")
                for page in pdf.pages:
                    txt = page.extract_text()
                    if txt: out.write(txt + "\n")
            except Exception as e:
                out.write(f"\n[Error reading {fname}: {e}]\n")
print("Extraction complete.")
