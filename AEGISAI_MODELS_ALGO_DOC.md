# AegisAI: Integrated Threat Detection System
## Technical Documentation: Models and Algorithms

### 1. Introduction
AegisAI is a multi-layered security system designed to detect various cyber threats, including phishing, spam, malicious URLs, and prompt injection attacks. It utilizes a hybrid AI architecture that combines traditional machine learning with state-of-the-art transformer-based deep learning models to achieve high accuracy while maintaining computational efficiency.

---

### 2. Core Detection Models

#### 2.1. Multinomial Naive Bayes (MNB)
*   **Purpose**: Content-based classification for spam and phishing emails.
*   **How it works**: A probabilistic classifier based on Bayes' theorem. It calculates the probability of a document belonging to a specific class (e.g., "Phishing" vs. "Safe") based on the frequency of terms within the document.
*   **Why used**: It is exceptionally fast for both training and inference. It serves as a robust baseline for keyword-heavy detection tasks and handles sparse data (like TF-IDF vectors) very effectively.

#### 2.2. Support Vector Machines (SVM)
*   **Purpose**: Malicious URL and domain classification.
*   **How it works**: SVM finds the optimal hyperplane that maximizes the margin between classes in a high-dimensional feature space. In AegisAI, it classifies URLs based on structural features and character patterns.
*   **Why used**: SVMs are highly effective in high-dimensional spaces and are robust against overfitting, making them ideal for identifying sophisticated URL patterns.

#### 2.3. DeBERTa-v3 (Decoding-enhanced BERT with disentangled attention)
*   **Purpose**: Deep semantic analysis for phishing and prompt injection.
*   **How it works**: A transformer-based model that uses a disentangled attention mechanism and an enhanced mask decoder. It understands the context and nuances of text far better than traditional models.
*   **Specific Usage**:
    *   **Phishing Detection**: Small-scale DeBERTa detects subtle social engineering tactics.
    *   **MNLI Fine-tuned**: Used for Natural Language Inference to detect contradictions between user input and system instructions (Prompt Injection).
*   **Why used**: Transforms raw text into deep contextual representations, catching threats that rely on semantic meaning rather than just keywords.

#### 2.4. DistilBERT
*   **Purpose**: Sentiment and Urgency Analysis.
*   **How it works**: A smaller, faster, cheaper version of BERT that retains about 97% of its performance. It classifies the "tone" of the communication.
*   **Why used**: Used to detect "vulnerability markers" such as extreme urgency, threats, or high-pressure language common in phishing attacks.

---

### 3. Key Algorithms and Techniques

#### 3.1. TF-IDF (Term Frequency-Inverse Document Frequency)
*   **Application**: Feature extraction for MNB and SVM.
*   **Logic**: It weights terms by how frequently they appear in a document relative to how rare they are across the entire dataset. This highlights "signature" words that indicate threats (e.g., "account-suspended", "login-verify").

#### 3.2. Sentence-Transformers (MiniLM-L6-v2)
*   **Application**: Semantic Similarity Analysis.
*   **Logic**: Maps sentences/URLs to a dense 384-dimensional vector space.
*   **Use Case**: Detects "Homoglyph Attacks" (e.g., `googIe.com` vs `google.com`) and checks if the semantic content of an email aligns with the linked landing page.

#### 3.3. Cosine Similarity
*   **Application**: Comparing URL and Text Embeddings.
*   **Formula**: `cos(θ) = (A · B) / (||A|| × ||B||)`
*   **Logic**: Measures the angle between two vectors. A high cosine similarity indicates the domains or texts are semantically related, helping identify brand impersonification.

---

### 4. Ensemble Architecture: The Synthesizer

AegisAI doesn't rely on a single model. Instead, it uses a **Weighted Ensemble Voting** system managed by the "Synthesizer Agent."

| Threat Component | Model / Method | Weight |
| :--- | :--- | :---: |
| Phishing Score | DeBERTa + MNB | 40% |
| URL Risk | SVM + Heuristics | 30% |
| Prompt Injection | MNLI Transformer | 30% |
| Spam Probability | Multinomial NB | 15% |
| Tone Analysis | DistilBERT | 10% |

**Decision Logic**: The system aggregates scores from all active agents and applies a dynamic threshold. If the weighted risk exceeds the threshold (typically 0.65), a high-priority alert is triggered.

---

### 5. Heuristic-Based Layers
In addition to AI, the system employs several rule-based security layers:
1.  **Regex Pattern Matching**: For identifying known jailbreak patterns and malicious IP address formats.
2.  **Keyword Spotting**: Immediate detection of blacklisted suspicious terms.
3.  **Domain Checker**: Verification of SSL certificates, domain age (via WHOIS), and TLD reputation.

---

### 6. Summary Table

| Model Class | Algorithm | Primary Strength |
| :--- | :--- | :--- |
| **Traditional ML** | Multinomial NB | Ultra-fast baseline detection |
| **Statistical** | TF-IDF | Feature relevance ranking |
| **Deep Learning**| DeBERTa-v3 | Semantic context awareness |
| **Metric Learning**| Cosine Similarity | Impersonation detection |
| **Ensemble** | Weighted Sum | Consensus-based accuracy |

---
**Document Status**: Official Internal Reference  
**Last Revised**: April 2026  
**System Version**: AegisAI v2.0
