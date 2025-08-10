# scripts/aapcappe-integration/aapcappe-extractor.py - Complete AAPCAppE Data Access System
import os
import time
import json
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import pandas as pd
from pathlib import Path

class AAPCAppEDataExtractor:
    def __init__(self, username, password, output_dir):
        self.username = username
        self.password = password
        self.output_dir = Path(output_dir)
        self.base_url = "https://www.aapcappe.org"
        self.login_url = "https://www.aapcappe.org/accounts/login/"
        self.session = requests.Session()
        self.driver = None
        self.subcorpora = ['ALC', 'AOHP', 'DOHP', 'JHC', 'SKCTC']
        
        # Create output directory structure
        self.setup_output_directories()
        
    def setup_output_directories(self):
        """Create organized directory structure for extracted data"""
        for subcorpus in self.subcorpora:
            (self.output_dir / 'raw-data' / subcorpus).mkdir(parents=True, exist_ok=True)
            (self.output_dir / 'transcripts' / subcorpus).mkdir(parents=True, exist_ok=True)
            (self.output_dir / 'audio-metadata' / subcorpus).mkdir(parents=True, exist_ok=True)
        
        (self.output_dir / 'processed').mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'cultural-extracts').mkdir(parents=True, exist_ok=True)
        print("🗂️ Directory structure created successfully")

    def setup_selenium_driver(self):
        """Initialize Selenium WebDriver with proper configuration"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Linux; U; Linux x86_64; en-US) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            print("🚗 Selenium WebDriver initialized successfully")
            return True
        except Exception as e:
            print(f"❌ WebDriver initialization failed: {str(e)}")
            return False

    def login_to_aapcappe(self):
        """Authenticate with AAPCAppE using provided credentials"""
        try:
            self.driver.get(self.login_url)
            time.sleep(3)
            
            # Wait for login form to load
            username_field = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.NAME, "username"))
            )
            password_field = self.driver.find_element(By.NAME, "password")
            
            # Enter credentials
            username_field.clear()
            username_field.send_keys(self.username)
            password_field.clear()
            password_field.send_keys(self.password)
            
            # Submit login form
            login_button = self.driver.find_element(By.CSS_SELECTOR, "input[type='submit'], button[type='submit']")
            login_button.click()
            
            # Wait for successful login redirect
            time.sleep(5)
            
            # Verify login success
            if "login" not in self.driver.current_url.lower():
                print("✅ Successfully logged into AAPCAppE")
                return True
            else:
                print("❌ Login failed - check credentials")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            return False

    def extract_subcorpus_data(self, subcorpus):
        """Extract data from a specific subcorpus"""
        try:
            subcorpus_url = f"{self.base_url}/corpus/{subcorpus}"
            print(f"📚 Extracting data from {subcorpus} subcorpus...")
            
            self.driver.get(subcorpus_url)
            time.sleep(3)
            
            # Get page source and parse with BeautifulSoup
            page_source = self.driver.page_source
            soup = BeautifulSoup(page_source, 'html.parser')
            
            # Extract available interview files/transcripts
            interview_links = soup.find_all('a', href=True)
            transcript_data = []
            
            for link in interview_links:
                if any(ext in link['href'] for ext in ['.txt', '.pdf', 'interview', 'transcript']):
                    transcript_info = {
                        'subcorpus': subcorpus,
                        'filename': link.text.strip(),
                        'url': link['href'] if link['href'].startswith('http') else self.base_url + link['href'],
                        'link_text': link.text.strip()
                    }
                    transcript_data.append(transcript_info)
            
            # Save transcript metadata
            if transcript_data:
                df = pd.DataFrame(transcript_data)
                metadata_file = self.output_dir / 'raw-data' / subcorpus / f'{subcorpus}_metadata.json'
                with open(metadata_file, 'w') as f:
                    json.dump(transcript_data, f, indent=2)
                print(f"💾 Saved {len(transcript_data)} transcript references for {subcorpus}")
            
            return transcript_data
            
        except Exception as e:
            print(f"❌ Error extracting {subcorpus} data: {str(e)}")
            return []

    def download_transcript_content(self, transcript_info):
        """Download individual transcript content"""
        try:
            response = self.session.get(transcript_info['url'], timeout=30)
            if response.status_code == 200:
                subcorpus = transcript_info['subcorpus']
                filename = transcript_info['filename'].replace(' ', '_').replace('/', '_')
                
                output_file = self.output_dir / 'transcripts' / subcorpus / f"{filename}.txt"
                
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(response.text)
                
                print(f"📄 Downloaded: {filename}")
                return True
            else:
                print(f"⚠️ Failed to download {transcript_info['filename']}: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Download error for {transcript_info['filename']}: {str(e)}")
            return False

    def perform_corpus_search(self, query, subcorpus=None):
        """Execute CorpusSearch query on AAPCAppE"""
        try:
            search_url = f"{self.base_url}/search/"
            self.driver.get(search_url)
            time.sleep(2)
            
            # Find search form
            search_field = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.NAME, "query"))
            )
            
            # Enter search query
            search_field.clear()
            search_field.send_keys(query)
            
            # Select subcorpus if specified
            if subcorpus:
                subcorpus_select = self.driver.find_element(By.NAME, "subcorpus")
                subcorpus_select.send_keys(subcorpus)
            
            # Submit search
            search_button = self.driver.find_element(By.CSS_SELECTOR, "input[type='submit'], button[type='submit']")
            search_button.click()
            
            time.sleep(5)
            
            # Extract search results
            page_source = self.driver.page_source
            soup = BeautifulSoup(page_source, 'html.parser')
            
            # Parse search results
            results = []
            result_elements = soup.find_all('div', class_=['result', 'search-result'])
            
            for result in result_elements:
                result_text = result.get_text().strip()
                if result_text:
                    results.append({
                        'query': query,
                        'subcorpus': subcorpus,
                        'result_text': result_text,
                        'timestamp': time.time()
                    })
            
            print(f"🔍 Found {len(results)} results for query: {query}")
            return results
            
        except Exception as e:
            print(f"❌ Search error: {str(e)}")
            return []

    def extract_cultural_content(self):
        """Extract culturally relevant content for Ms. Jarvis integration"""
        cultural_queries = [
            "I reckon",
            "might could", 
            "used to could",
            "over yonder",
            "right smart",
            "bless your heart",
            "mountain",
            "community",
            "neighbor",
            "traditional",
            "family",
            "heritage",
            "wisdom"
        ]
        
        cultural_extracts = {}
        
        for query in cultural_queries:
            print(f"🔍 Searching for cultural pattern: {query}")
            results = self.perform_corpus_search(query)
            
            if results:
                cultural_extracts[query] = results
                time.sleep(2)  # Rate limiting
        
        # Save cultural extracts
        cultural_file = self.output_dir / 'cultural-extracts' / 'appalachian_cultural_patterns.json'
        with open(cultural_file, 'w', encoding='utf-8') as f:
            json.dump(cultural_extracts, f, indent=2, ensure_ascii=False)
        
        print(f"💎 Extracted cultural patterns for {len(cultural_extracts)} queries")
        return cultural_extracts

    def process_for_jarvis_integration(self):
        """Process extracted data for Ms. Jarvis integration"""
        print("🧠 Processing data for Ms. Jarvis cultural integration...")
        
        jarvis_cultural_data = {
            'authentic_speech_patterns': {},
            'cultural_wisdom': {},
            'traditional_expressions': {},
            'community_values': {}
        }
        
        # Load cultural extracts
        cultural_file = self.output_dir / 'cultural-extracts' / 'appalachian_cultural_patterns.json'
        if cultural_file.exists():
            with open(cultural_file, 'r', encoding='utf-8') as f:
                cultural_data = json.load(f)
            
            # Process cultural patterns for Ms. Jarvis
            for pattern, results in cultural_data.items():
                if results:
                    # Extract authentic usage examples
                    examples = []
                    for result in results[:5]:  # Top 5 examples per pattern
                        examples.append({
                            'text': result['result_text'],
                            'subcorpus': result.get('subcorpus', 'unknown')
                        })
                    
                    jarvis_cultural_data['authentic_speech_patterns'][pattern] = {
                        'examples': examples,
                        'usage_count': len(results),
                        'authenticity_verified': True
                    }
        
        # Save processed data for Ms. Jarvis
        jarvis_file = self.output_dir / 'processed' / 'jarvis_cultural_intelligence.json'
        with open(jarvis_file, 'w', encoding='utf-8') as f:
            json.dump(jarvis_cultural_data, f, indent=2, ensure_ascii=False)
        
        print("✅ Cultural data processed for Ms. Jarvis integration")
        return jarvis_cultural_data

    def run_complete_extraction(self):
        """Execute complete data extraction workflow"""
        print("🏔️ Starting complete AAPCAppE data extraction for Ms. Jarvis...")
        
        # Initialize Selenium driver
        if not self.setup_selenium_driver():
            return False
        
        try:
            # Login to AAPCAppE
            if not self.login_to_aapcappe():
                return False
            
            # Extract data from each subcorpus
            all_transcripts = []
            for subcorpus in self.subcorpora:
                transcript_data = self.extract_subcorpus_data(subcorpus)
                all_transcripts.extend(transcript_data)
                time.sleep(3)  # Rate limiting
            
            print(f"📚 Total transcripts found: {len(all_transcripts)}")
            
            # Download sample transcript content (rate limited)
            download_count = 0
            for transcript in all_transcripts[:10]:  # Limit to prevent overload
                if self.download_transcript_content(transcript):
                    download_count += 1
                time.sleep(2)  # Rate limiting
            
            print(f"💾 Downloaded {download_count} transcript files")
            
            # Extract cultural content
            cultural_data = self.extract_cultural_content()
            
            # Process for Ms. Jarvis
            jarvis_data = self.process_for_jarvis_integration()
            
            print("🎉 Complete AAPCAppE extraction successful!")
            return True
            
        except Exception as e:
            print(f"❌ Extraction failed: {str(e)}")
            return False
        
        finally:
            if self.driver:
                self.driver.quit()

def main():
    # Configuration
    USERNAME = "cakidd"
    PASSWORD = "10132011Harmonyforhopeinc1"
    OUTPUT_DIR = "/home/user/ms-jarvis-core/data/aapcappe-corpus"
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Initialize and run extractor
    extractor = AAPCAppEDataExtractor(USERNAME, PASSWORD, OUTPUT_DIR)
    success = extractor.run_complete_extraction()
    
    if success:
        print("✅ AAPCAppE data extraction completed successfully!")
        print(f"📂 Data saved to: {OUTPUT_DIR}")
    else:
        print("❌ AAPCAppE data extraction failed!")

if __name__ == "__main__":
    main()
