from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.chat_models import ChatOllama
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts.prompt import PromptTemplate
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from docx import Document
from flask import *
from flask_cors import CORS
import json
import os
import sys
import datetime

app = Flask(__name__)
# CORS(app, resources={r'*': {'origins': 'http://localhost:8000'}})
CORS(app)
host = 'localhost'
port = 5100

# Configuration
ngrok = 'https://6c82-35-229-167-67.ngrok-free.app'
device = 'cpu'

# Load language model
llm_model = ChatOllama(
    model='meta-llama-3.1',
    #base_url=ngrok      # 주석 해제 시 코랩 자원으로 돌아감, # 주석 설정 시 로컬 자원으로 돌아감 
)
llm_model_json = ChatOllama(
    model='meta-llama-3.1',
    format='json', 
    #base_url=ngrok       # 주석 해제 시 코랩 자원으로 돌아감, # 주석 설정 시 로컬 자원으로 돌아감 
)


# Load embeddings model
embedding_model = HuggingFaceEmbeddings(
    model_name="BAAI/bge-m3",
    model_kwargs={'device': device},
    encode_kwargs={'normalize_embeddings': True}
)

# Define prompt
prompt_template = '''Use the following pieces of context to answer the question at the end.
If you don't find the answer in context, don't try to make up an answer.
If you find the answer in context, answer me only use korean.

context: {context}

Question: {question}
Helpful Answer:'''
rag_prompt = PromptTemplate.from_template(prompt_template)

# Function to create the DOCX file
def create_docx(response, vectorstore):
    doc = Document()
    title = response.get('title', '제목 없음')
    doc.add_heading(title, level=0)

    doc.add_heading('목차', level=1)
    doc.add_paragraph('1. 개요')
    doc.add_paragraph('2. 본문')
    for n, cont in enumerate(response.get('content', []), 1):
        doc.add_paragraph(f'\t2-{n}. {cont}')

    doc.add_heading('1. 개요', level=1)
    doc.add_paragraph(response.get('summary', ''))

    doc.add_heading('2. 본문', level=1)
    for n, cont in enumerate(response.get('content', []), 1):
        question = f'제목이 "{title}"인 보고서의 "{cont}" 부분 상세 내용을 글로 풀어서 적어줘'    # {title}라는 보고서의 {cont} 부분 상세 내용 markdown 형식으로
        memory = ConversationBufferMemory(
            memory_key='chat_history',
            return_messages=True
        )
        conversation_chain = ConversationalRetrievalChain.from_llm(
            llm=llm_model,
            retriever=vectorstore.as_retriever(),
            condense_question_prompt=rag_prompt,
            memory=memory
        )
        res = conversation_chain({'question': question})
        doc.add_heading(f'\t2-{n}. {cont}', level=2)
        doc.add_paragraph(res['chat_history'][1].content)
    
    # Format date to avoid issues in filenames
    doc.save(f'./processed/{datetime.datetime.today().strftime("%g%m%d%H%M%S")}.docx')
    return f'/processed/{datetime.datetime.today().strftime("%g%m%d%H%M%S")}.docx'

def process_file(file_path):
    # if not os.path.isfile(file_path):
    #     print(f'파일이 존재하지 않습니다: {file_path}')
    #     return
    
    text_sum = ''
    # files = [file_path]
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    for file in file_path:
        reader = PdfReader(file)
        for page in reader.pages:  # 페이지 별로 텍스트 추출
            text = page.extract_text()
            corrected_text = text.encode('utf-8', errors='ignore').decode('utf-8')  # 인코딩 오류 무시 및 텍스트 누적
            text_sum += corrected_text + '\n'
    splits = text_splitter.split_text(text_sum)
    print(len(splits))
    if len(splits) == 0: 
        return False
    # Create FAISS index
    vectorstore = FAISS.from_texts(splits, embedding_model)
    
    question = '''문서 요약 관련 보고서를 만들어줘 
        'title': '보고서의 제목',
        'content':list['보고서의 목차별 제목'] 20글자 이내,
        'summary': '보고서의 개요' 1000글자 이내
    key is title, content, summary.
    Respond using JSON only.'''
    memory = ConversationBufferMemory(
        memory_key='chat_history',
        return_messages=True,
    )

    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=llm_model_json,
        retriever=vectorstore.as_retriever(),
        condense_question_prompt=rag_prompt,
        memory=memory,
    )
    res = conversation_chain({'question': question})
    response = res['chat_history'][1].content.replace('\n', '').lstrip().rstrip()
    response = json.loads(response)

    return create_docx(response, vectorstore)

@app.route('/summary', methods=['POST'])
def summary():
    
    files = [request.files[i] for i in request.files]
    processedFilePath = process_file(files)
    
    if processedFilePath:
        return jsonify({
            'result': 'ok',
            'processedFilePath': processedFilePath
        })
    else:
        return jsonify({
            'result': 'error',
            'error': '텍스트를 인식할 수 없음'
        })

@app.route('/generate_report', methods=['POST'])
def generate_report():
    # 사용자가 입력한 텍스트 가져오기
    input_text = request.form.get('inputText', '').strip()
    
    if not input_text:
        return jsonify({
            'result': 'error',
            'error': '입력된 텍스트가 없습니다.'
        })

    # 텍스트를 분할하여 벡터스토어 생성
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_text(input_text)

    if len(splits) == 0: 
        return jsonify({
            'result': 'error',
            'error': '텍스트 분할에 실패했습니다.'
        })
    
    # Create FAISS index from input text splits
    vectorstore = FAISS.from_texts(splits, embedding_model)

    # 보고서 생성 요청 프롬프트
    question = f'''사용자의 입력: {input_text} 
    사용자의 입력을 읽고 관련 보고서를 만들어줘
        'title': '보고서의 제목',
        'content':list['보고서의 목차별 제목'] 50글자 이내,
        'summary': '보고서의 개요' 1000글자 이내
    key is title, content, summary.
    Respond using JSON only.'''

    # 메모리 설정 및 대화형 체인 생성
    memory = ConversationBufferMemory(
        memory_key='chat_history',
        return_messages=True,
    )

    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=llm_model_json,
        retriever=vectorstore.as_retriever(),
        condense_question_prompt=rag_prompt,
        memory=memory,
    )

    # 보고서 생성
    res = conversation_chain({'question': question})
    response_content = res['chat_history'][1].content.replace('\n', '').lstrip().rstrip()

    try:
        # JSON 형식으로 파싱
        response = json.loads(response_content)
    except json.JSONDecodeError:
        return jsonify({
            'result': 'error',
            'error': '보고서 생성 중 JSON 파싱 오류가 발생했습니다.'
        })
    
    # DOCX 파일 생성
    processedFilePath = create_docx(response, vectorstore)
    
    # 결과 반환
    if processedFilePath:
        return jsonify({
            'result': 'ok',
            'report': f'보고서가 성공적으로 생성되었습니다. 다운로드 링크: {processedFilePath}',
            'processedFilePath': processedFilePath
        })
    else:
        return jsonify({
            'result': 'error',
            'error': '보고서 생성에 실패했습니다.'
        })




if __name__ == '__main__':
    app.run(host= host, port=port)