import os
from openai import OpenAI
from typing import List, Dict, Any, Optional
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_guide_from_book(
    book_content: str,
    title: str,
    author: str,
    language: str,
    guide_type: str = "standard"
) -> Dict[str, Any]:
    """
    Generate a study guide from book content using OpenAI API.
    
    Args:
        book_content: The text content of the book
        title: Book title
        author: Book author
        language: Book language code (en, es, zh, hi, ru)
        guide_type: Type of guide to generate (standard, academic, practical, summary)
        
    Returns:
        Dictionary containing the generated guide sections
    """
    # Validate language
    if language not in settings.SUPPORTED_LANGUAGES:
        language = "en"  # Default to English if unsupported
    
    # Prepare language-specific prompts
    prompts = {
        "en": {
            "system": "You are an expert educator creating a comprehensive study guide for a book.",
            "chapters": f"Create a chapter-by-chapter summary for '{title}' by {author}. For each chapter, include: 1) Brief summary (100-150 words), 2) Key concepts, 3) Two thought-provoking questions.",
            "synthesis": f"Create a synthesis of the main ideas in '{title}' by {author}. Include: 1) Core themes, 2) Key insights, 3) Practical applications, 4) Action plan for implementing the book's teachings.",
            "quiz": f"Create 10 multiple-choice questions to test understanding of '{title}' by {author}. Each question should have 4 options with one correct answer. Include explanation for the correct answer."
        },
        "es": {
            "system": "Eres un educador experto que crea una guía de estudio completa para un libro.",
            "chapters": f"Crea un resumen capítulo por capítulo de '{title}' de {author}. Para cada capítulo, incluye: 1) Breve resumen (100-150 palabras), 2) Conceptos clave, 3) Dos preguntas para reflexionar.",
            "synthesis": f"Crea una síntesis de las ideas principales de '{title}' de {author}. Incluye: 1) Temas centrales, 2) Ideas clave, 3) Aplicaciones prácticas, 4) Plan de acción para implementar las enseñanzas del libro.",
            "quiz": f"Crea 10 preguntas de opción múltiple para evaluar la comprensión de '{title}' de {author}. Cada pregunta debe tener 4 opciones con una respuesta correcta. Incluye explicación para la respuesta correcta."
        },
        "zh": {
            "system": "您是一位专家教育者，为一本书创建全面的学习指南。",
            "chapters": f"为{author}的《{title}》创建逐章摘要。对于每一章，包括：1）简短摘要（100-150字），2）关键概念，3）两个发人深省的问题。",
            "synthesis": f"创建{author}的《{title}》中主要思想的综合。包括：1）核心主题，2）关键见解，3）实际应用，4）实施书中教导的行动计划。",
            "quiz": f"创建10个选择题来测试对{author}的《{title}》的理解。每个问题应有4个选项，其中一个正确答案。包括正确答案的解释。"
        },
        "hi": {
            "system": "आप एक किताब के लिए व्यापक अध्ययन गाइड बनाने वाले विशेषज्ञ शिक्षक हैं।",
            "chapters": f"{author} द्वारा '{title}' का अध्याय-दर-अध्याय सारांश बनाएं। प्रत्येक अध्याय के लिए, शामिल करें: 1) संक्षिप्त सारांश (100-150 शब्द), 2) प्रमुख अवधारणाएँ, 3) दो विचारोत्तेजक प्रश्न।",
            "synthesis": f"{author} द्वारा '{title}' में मुख्य विचारों का संश्लेषण बनाएं। शामिल करें: 1) मुख्य विषय, 2) प्रमुख अंतर्दृष्टि, 3) व्यावहारिक अनुप्रयोग, 4) पुस्तक की शिक्षाओं को लागू करने के लिए कार्य योजना।",
            "quiz": f"{author} द्वारा '{title}' की समझ का परीक्षण करने के लिए 10 बहुविकल्पीय प्रश्न बनाएं। प्रत्येक प्रश्न में 4 विकल्प होने चाहिए जिनमें एक सही उत्तर है। सही उत्तर के लिए स्पष्टीकरण शामिल करें।"
        },
        "ru": {
            "system": "Вы эксперт-педагог, создающий комплексное учебное руководство по книге.",
            "chapters": f"Создайте краткое изложение книги '{title}' автора {author} по главам. Для каждой главы включите: 1) Краткое содержание (100-150 слов), 2) Ключевые концепции, 3) Два вопроса для размышления.",
            "synthesis": f"Создайте синтез основных идей книги '{title}' автора {author}. Включите: 1) Основные темы, 2) Ключевые выводы, 3) Практическое применение, 4) План действий по внедрению учений книги.",
            "quiz": f"Создайте 10 вопросов с множественным выбором для проверки понимания книги '{title}' автора {author}. Каждый вопрос должен иметь 4 варианта ответа с одним правильным. Включите объяснение правильного ответа."
        }
    }
    
    # Use the appropriate language prompts or default to English
    prompt_set = prompts.get(language, prompts["en"])
    
    # Adjust based on guide type
    if guide_type == "academic":
        prompt_set["system"] += " Focus on academic analysis and critical thinking."
    elif guide_type == "practical":
        prompt_set["system"] += " Focus on practical applications and exercises."
    elif guide_type == "summary":
        prompt_set["system"] += " Focus on concise summaries and key takeaways."
    
    # Truncate book content if too long
    max_tokens = 15000  # Adjust based on model limits
    if len(book_content) > max_tokens * 4:  # Rough character to token ratio
        book_content = book_content[:max_tokens * 4]
        book_content += "\n\n[Content truncated due to length]"
    
    # Generate chapter summaries
    chapters_response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": prompt_set["system"]},
            {"role": "user", "content": prompt_set["chapters"] + "\n\nBook content: " + book_content[:5000]}
        ],
        temperature=0.7,
        max_tokens=2000
    )
    
    # Generate synthesis
    synthesis_response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": prompt_set["system"]},
            {"role": "user", "content": prompt_set["synthesis"] + "\n\nBook content: " + book_content[:5000]}
        ],
        temperature=0.7,
        max_tokens=1500
    )
    
    # Generate quiz
    quiz_response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": prompt_set["system"]},
            {"role": "user", "content": prompt_set["quiz"] + "\n\nBook content: " + book_content[:5000]}
        ],
        temperature=0.7,
        max_tokens=1500
    )
    
    # Compile the guide
    guide = {
        "title": title,
        "author": author,
        "language": language,
        "guide_type": guide_type,
        "chapters": chapters_response.choices[0].message.content,
        "synthesis": synthesis_response.choices[0].message.content,
        "quiz": quiz_response.choices[0].message.content,
        "created_at": str(datetime.now())
    }
    
    return guide

def chat_with_book(
    book_content: str,
    question: str,
    language: str,
    chat_history: Optional[List[Dict[str, str]]] = None
) -> str:
    """
    Generate a response to a question about a book using OpenAI API.
    
    Args:
        book_content: The text content of the book
        question: User's question about the book
        language: Language code (en, es, zh, hi, ru)
        chat_history: Optional list of previous messages
        
    Returns:
        Generated response
    """
    # Validate language
    if language not in settings.SUPPORTED_LANGUAGES:
        language = "en"  # Default to English if unsupported
    
    # Prepare language-specific system prompts
    system_prompts = {
        "en": "You are a helpful AI assistant that answers questions about books. Answer based only on the book content provided. If the answer is not in the book content, say so politely.",
        "es": "Eres un asistente de IA útil que responde preguntas sobre libros. Responde basándote únicamente en el contenido del libro proporcionado. Si la respuesta no está en el contenido del libro, dilo educadamente.",
        "zh": "您是一位有用的AI助手，可以回答有关书籍的问题。仅根据提供的书籍内容回答。如果答案不在书籍内容中，请礼貌地说明。",
        "hi": "आप एक सहायक AI सहायक हैं जो पुस्तकों के बारे में प्रश्नों का उत्तर देता है। केवल प्रदान की गई पुस्तक सामग्री के आधार पर उत्तर दें। यदि उत्तर पुस्तक सामग्री में नहीं है, तो विनम्रता से कहें।",
        "ru": "Вы - полезный ИИ-ассистент, который отвечает на вопросы о книгах. Отвечайте только на основе предоставленного содержания книги. Если ответа нет в содержании книги, вежливо скажите об этом."
    }
    
    # Truncate book content if too long
    max_tokens = 12000  # Adjust based on model limits
    if len(book_content) > max_tokens * 4:  # Rough character to token ratio
        book_content = book_content[:max_tokens * 4]
        book_content += "\n\n[Content truncated due to length]"
    
    # Prepare messages
    messages = [
        {"role": "system", "content": system_prompts.get(language, system_prompts["en"])},
        {"role": "system", "content": f"Book content: {book_content[:6000]}"}
    ]
    
    # Add chat history if provided
    if chat_history:
        for message in chat_history[-5:]:  # Include only the last 5 messages
            messages.append({"role": message["role"], "content": message["content"]})
    
    # Add the current question
    messages.append({"role": "user", "content": question})
    
    # Generate response
    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=1000
    )
    
    return response.choices[0].message.content

# Add missing import
from datetime import datetime
