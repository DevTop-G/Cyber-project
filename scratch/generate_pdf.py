from fpdf import FPDF
import datetime

class AegisReport(FPDF):
    def header(self):
        # Logo or Title header
        if self.page_no() > 1:
            self.set_font('helvetica', 'B', 10)
            self.set_text_color(100, 100, 100)
            self.cell(0, 10, 'AegisAI: Technical Documentation - Models & Algorithms', 0, 1, 'R')
            self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(128)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def chapter_title(self, title):
        self.set_font('helvetica', 'B', 16)
        self.set_fill_color(230, 230, 230)
        self.set_text_color(30, 60, 120)
        self.cell(0, 10, title, 0, 1, 'L', True)
        self.ln(5)

    def chapter_body(self, body):
        self.set_font('helvetica', '', 11)
        self.set_text_color(0)
        self.multi_cell(0, 6, body)
        self.ln()

    def section_title(self, title):
        self.set_font('helvetica', 'B', 13)
        self.set_text_color(50, 50, 150)
        self.cell(0, 10, title, 0, 1, 'L')
        self.ln(2)

def generate_pdf(output_path, cover_img_path):
    pdf = AegisReport()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # --- COVER PAGE ---
    pdf.add_page()
    if cover_img_path:
        # Cover image (centered)
        pdf.image(cover_img_path, x=0, y=0, w=210, h=297)
    
    # Overlay title on cover
    pdf.set_y(100)
    pdf.set_font('helvetica', 'B', 40)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 20, 'AegisAI', 0, 1, 'C')
    pdf.set_font('helvetica', 'B', 20)
    pdf.cell(0, 10, 'Technical Documentation', 0, 1, 'C')
    pdf.ln(10)
    pdf.set_font('helvetica', 'I', 15)
    pdf.cell(0, 10, 'Models and Algorithms Reference', 0, 1, 'C')
    
    pdf.set_y(-40)
    pdf.set_font('helvetica', '', 12)
    pdf.cell(0, 10, f'Version 2.0 | {datetime.datetime.now().strftime("%B %Y")}', 0, 1, 'C')

    # --- CONTENT PAGES ---
    pdf.add_page()
    pdf.set_text_color(0)
    
    pdf.chapter_title('1. Introduction')
    pdf.chapter_body(
        'AegisAI is a multi-layered security system designed to detect various cyber threats, '
        'including phishing, spam, malicious URLs, and prompt injection attacks. It utilizes '
        'a hybrid AI architecture that combines traditional machine learning with state-of-the-art '
        'transformer-based deep learning models to achieve high accuracy while maintaining '
        'computational efficiency.'
    )

    pdf.chapter_title('2. Core Detection Models')
    
    pdf.section_title('2.1. Multinomial Naive Bayes (MNB)')
    pdf.chapter_body(
        '- Purpose: Content-based classification for spam and phishing emails.\n'
        '- How it works: A probabilistic classifier based on Bayes\' theorem. It calculates the probability of a document belonging to a specific class based on the frequency of terms.\n'
        '- Why used: Exceptionally fast for both training and inference. Robust baseline for keyword-heavy detection tasks.'
    )

    pdf.section_title('2.2. Support Vector Machines (SVM)')
    pdf.chapter_body(
        '- Purpose: Malicious URL and domain classification.\n'
        '- How it works: SVM finds the optimal hyperplane that maximizes the margin between classes in a high-dimensional feature space.\n'
        '- Why used: Highly effective in high-dimensional spaces and robust against overfitting.'
    )

    pdf.section_title('2.3. DeBERTa-v3 (Transformers)')
    pdf.chapter_body(
        '- Purpose: Deep semantic analysis for phishing and prompt injection.\n'
        '- How it works: A transformer-based model that uses a disentangled attention mechanism. It understands the context and nuances of text far better than traditional models.\n'
        '- Specific Usage: Small-scale DeBERTa for phishing; MNLI fine-tuned for prompt injection detection (detecting semantic contradictions).'
    )

    pdf.section_title('2.4. DistilBERT')
    pdf.chapter_body(
        '- Purpose: Sentiment and Urgency Analysis.\n'
        '- Why used: Detects "vulnerability markers" such as extreme urgency or high-pressure language common in phishing attacks.'
    )

    pdf.chapter_title('3. Key Algorithms')
    
    pdf.section_title('3.1. TF-IDF')
    pdf.chapter_body(
        'Application: Feature extraction for MNB and SVM. Weights terms by frequency relative to scarcity across the dataset.'
    )

    pdf.section_title('3.2. Sentence-Transformers (MiniLM-L6-v2)')
    pdf.chapter_body(
        'Application: Semantic Similarity. Maps sentences to a dense 384-dimensional vector space to detect brand impersonation (e.g., Homoglyph attacks).'
    )

    pdf.section_title('3.3. Cosine Similarity')
    pdf.chapter_body(
        'Logic: Measures the angle between two vectors. High similarity indicates related domains or spoofed brands.'
    )

    pdf.chapter_title('4. Ensemble Architecture')
    pdf.chapter_body(
        'AegisAI uses a Weighted Ensemble Voting system (Synthesizer Agent):\n'
        '- Phishing Score: 40%\n'
        '- URL Risk Score: 30%\n'
        '- Prompt Injection: 30%\n'
        '- Spam Probability: 15%\n'
        '- Sentiment Analysis: 10%\n\n'
        'The system triggers a high-priority alert if the total weighted risk exceeds 0.65.'
    )

    pdf.chapter_title('5. Summary Table')
    # Simple table representation
    pdf.set_font('helvetica', 'B', 10)
    pdf.cell(50, 10, 'Model Class', 1)
    pdf.cell(60, 10, 'Algorithm', 1)
    pdf.cell(80, 10, 'Primary Strength', 1)
    pdf.ln()
    
    pdf.set_font('helvetica', '', 10)
    data = [
        ['Traditional ML', 'Multinomial NB', 'Ultra-fast baseline detection'],
        ['Statistical', 'TF-IDF', 'Feature relevance ranking'],
        ['Deep Learning', 'DeBERTa-v3', 'Semantic context awareness'],
        ['Metric Learning', 'Cosine Similarity', 'Impersonation detection'],
        ['Ensemble', 'Weighted Sum', 'Consensus-based accuracy']
    ]
    for row in data:
        pdf.cell(50, 10, row[0], 1)
        pdf.cell(60, 10, row[1], 1)
        pdf.cell(80, 10, row[2], 1)
        pdf.ln()

    pdf.output(output_path)
    print(f"PDF generated successfully at: {output_path}")

if __name__ == "__main__":
    generate_pdf(
        "c:/Users/suraj/Downloads/TOPPER G/viie-business-it-project/AegisAI_Technical_Documentation.pdf",
        "C:/Users/suraj/.gemini/antigravity/brain/afaa80d0-5adc-425d-a969-53d3c512c967/aegisai_doc_cover_1776489867428.png"
    )
