export const Footer = () => {
  return (
    <footer className="border-t py-4">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Sistema de Escala Inteligente. Todos
          os direitos reservados.
        </p>
        <p>Versão 0.0.1</p>
      </div>
    </footer>
  )
}
