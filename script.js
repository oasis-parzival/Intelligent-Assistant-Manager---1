// Configuration
const CONFIG = {
    // Replace with your actual DeepSeek API key
    API_KEY: "sk-84c6e3770c1b45d288dc23e77cb7cb2f",
    API_URL: "https://api.deepseek.com/v1/chat/completions",
    MODEL: "deepseek-chat",
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.7,
  }
  
  // DOM Elements
  const chatMessages = document.getElementById("chatMessages")
  const messageInput = document.getElementById("messageInput")
  const sendButton = document.getElementById("sendButton")
  const chatForm = document.getElementById("chatForm")
  const typingIndicator = document.getElementById("typingIndicator")
  
  // State
  let isLoading = false
  const conversationHistory = []
  
  // Initialize the application
  document.addEventListener("DOMContentLoaded", () => {
    initializeChat()
    setupEventListeners()
    setupScrollAnimations()
  })
  
  // Initialize chat functionality
  function initializeChat() {
    // Check if API key is configured
    if (!CONFIG.API_KEY || CONFIG.API_KEY === "your-deepseek-api-key-here") {
      showError("Please configure your DeepSeek API key in the script.js file.")
      return
    }
  
    // Add welcome message to conversation history
    conversationHistory.push({
      role: "assistant",
      content:
        "Hello! I'm IAM-1, your intelligent AI assistant. I'm here to help you with any questions or tasks you might have. What would you like to discuss today?",
    })
  
    // Auto-resize textarea
    setupTextareaAutoResize()
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Form submission
    chatForm.addEventListener("submit", handleFormSubmit)
  
    // Enter key handling
    messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (!isLoading && messageInput.value.trim()) {
          handleFormSubmit(e)
        }
      }
    })
  
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute("href"))
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      })
    })
  }
  
  // Handle form submission
  async function handleFormSubmit(e) {
    e.preventDefault()
  
    const message = messageInput.value.trim()
    if (!message || isLoading) return
  
    // Add user message
    addMessage(message, "user")
    messageInput.value = ""
    resizeTextarea()
  
    // Add to conversation history
    conversationHistory.push({
      role: "user",
      content: message,
    })
  
    // Show typing indicator and get AI response
    showTypingIndicator()
  
    try {
      const response = await getAIResponse(conversationHistory)
      hideTypingIndicator()
  
      if (response) {
        addMessage(response, "assistant")
        conversationHistory.push({
          role: "assistant",
          content: response,
        })
      }
    } catch (error) {
      hideTypingIndicator()
      showError("Sorry, I encountered an error. Please try again.")
      console.error("AI Response Error:", error)
    }
  }
  
  // Get AI response from DeepSeek API
  async function getAIResponse(messages) {
    isLoading = true
    sendButton.disabled = true
  
    try {
      const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CONFIG.API_KEY}`,
        },
        body: JSON.stringify({
          model: CONFIG.MODEL,
          messages: messages,
          max_tokens: CONFIG.MAX_TOKENS,
          temperature: CONFIG.TEMPERATURE,
          stream: false,
        }),
      })
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
  
      const data = await response.json()
  
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("API Error:", error)
      throw error
    } finally {
      isLoading = false
      sendButton.disabled = false
    }
  }
  
  // Add message to chat
  function addMessage(content, sender) {
    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${sender}`
  
    const avatar = document.createElement("div")
    avatar.className = "message-avatar"
    avatar.innerHTML = sender === "user" ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>'
  
    const messageContent = document.createElement("div")
    messageContent.className = "message-content"
  
    const bubble = document.createElement("div")
    bubble.className = "message-bubble"
  
    const text = document.createElement("p")
    text.textContent = content
    bubble.appendChild(text)
  
    const time = document.createElement("div")
    time.className = "message-time"
    time.textContent = formatTime(new Date())
  
    messageContent.appendChild(bubble)
    messageContent.appendChild(time)
  
    messageDiv.appendChild(avatar)
    messageDiv.appendChild(messageContent)
  
    chatMessages.appendChild(messageDiv)
    scrollToBottom()
  }
  
  // Show typing indicator
  function showTypingIndicator() {
    typingIndicator.style.display = "flex"
    scrollToBottom()
  }
  
  // Hide typing indicator
  function hideTypingIndicator() {
    typingIndicator.style.display = "none"
  }
  
  // Show error message
  function showError(message) {
    const errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.textContent = message
  
    const chatContainer = document.querySelector(".chat-container")
    chatContainer.insertBefore(errorDiv, chatContainer.firstChild)
  
    // Remove error after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv)
      }
    }, 5000)
  }
  
  // Scroll to bottom of chat
  function scrollToBottom() {
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight
    }, 100)
  }
  
  // Format time
  function formatTime(date) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  
  // Setup textarea auto-resize
  function setupTextareaAutoResize() {
    messageInput.addEventListener("input", resizeTextarea)
  }
  
  function resizeTextarea() {
    messageInput.style.height = "auto"
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + "px"
  }
  
  // Setup scroll animations
  function setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("appear")
        }
      })
    }, observerOptions)
  
    // Observe elements with fade-in class
    document.querySelectorAll(".fade-in").forEach((el) => {
      observer.observe(el)
    })
  }
  
  // Navbar scroll effect
  window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar")
    if (window.scrollY > 50) {
      navbar.style.background = "rgba(255, 255, 255, 0.98)"
      navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)"
    } else {
      navbar.style.background = "rgba(255, 255, 255, 0.95)"
      navbar.style.boxShadow = "none"
    }
  })
  
  // Utility functions
  function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
  
  // Export for potential module usage
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      CONFIG,
      addMessage,
      getAIResponse,
      formatTime,
    }
  }
  