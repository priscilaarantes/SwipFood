import React, { createContext, useContext, useState } from 'react'
import Toast from '../components/Toast'

const ToastContext = createContext(null)

// Contexto para exibir notificações flutuantes em qualquer página
export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ mensagem: '', tipo: 'sucesso', visivel: false })

  const exibirToast = (mensagem, tipo = 'sucesso') => {
    setToast({ mensagem, tipo, visivel: true })
  }

  return (
    <ToastContext.Provider value={{ exibirToast }}>
      {children}
      <Toast
        mensagem={toast.mensagem}
        tipo={toast.tipo}
        visivel={toast.visivel}
        aoFechar={() => setToast((atual) => ({ ...atual, visivel: false }))}
      />
    </ToastContext.Provider>
  )
}

// Hook para disparar notificações
export function useToast() {
  return useContext(ToastContext)
}
