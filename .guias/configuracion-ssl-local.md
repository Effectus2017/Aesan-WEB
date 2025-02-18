# Guía para Configurar SSL en un Dominio Local

## Pasos para Configurar SSL en `nutre-dev.local`

### 1. **Instalar mkcert**

- **Windows**: `choco install mkcert`
- **Mac**: `brew install mkcert`
- **Linux**: Sigue las instrucciones de [mkcert](https://github.com/FiloSottile/mkcert).

### 2. **Generar el Certificado**

Ejecuta los siguientes comandos para generar el certificado SSL:

```bash
mkcert -install
mkcert nutre-dev.local
```

Esto generará dos archivos: `nutre-dev.local.pem` (certificado) y `nutre-dev.local-key.pem` (clave privada).

### 3. **Configurar Angular para Usar HTTPS**

Modifica el archivo `angular.json` para usar HTTPS con el certificado generado:

```json
"architect": {
  "serve": {
    "options": {
      "ssl": true,
      "sslKey": "path/to/nutre-dev.local-key.pem",
      "sslCert": "path/to/nutre-dev.local.pem",
      "host": "nutre-dev.local",
      "port": 4202
    }
  }
}
```

### 4. **Acceder a la URL Segura**

Ahora puedes acceder a tu aplicación usando:

```
https://nutre-dev.local:4201
```

### 5. **Configurar el Archivo `hosts`**

Asegúrate de que `nutre-dev.local` esté mapeado a `127.0.0.1` en tu archivo `hosts`:

```plaintext
127.0.0.1   nutre-dev.local
```

### 7. **Acceder a la URL sin Puerto**

Con el proxy inverso configurado, puedes acceder a:

```
https://nutre-dev.local
```

## Comandos Útiles
