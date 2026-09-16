import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Crear Cuenta</CardTitle>
        <CardDescription>
          Ingrese sus datos a continuación para crear su cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nombre y apellido</FieldLabel>
              <Input id="name" type="text" placeholder="Juan Pérez" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@ejemplo.com"
                required
              />
              <FieldDescription>
                Utilizaremos esto para ponernos en contacto con usted. No compartiremos su correo electrónico con nadie más.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <Input id="password" type="password" required />
              <FieldDescription>
                Debe tener al menos 8 caracteres de longitud
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirmar Contraseña
              </FieldLabel>
              <Input id="confirm-password" type="password" required />
              <FieldDescription>Por favor, confirme su contraseña</FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">Crear Cuenta</Button>
                <Button variant="outline" type="button">
                  Continuar con Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  ¿Ya tienes una cuenta? <a href="/login">Iniciar Sesión</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
