# Guía completa de UFW (Uncomplicated Firewall)

## ¿Qué es UFW?

UFW (Uncomplicated Firewall) es una interfaz simple para manejar iptables en Linux. Es la forma más sencilla de configurar un firewall en Ubuntu/Debian.

---

## Paso 1: Instalar UFW

```bash
apt install -y ufw
```

Esto instala UFW (Uncomplicated Firewall), que es una interfaz simple para manejar iptables.

---

## Paso 2: Configurar políticas por defecto

```bash
ufw default deny incoming
ufw default allow outgoing
```

**¿Qué hace esto?**
- **Primera línea**: Bloquea TODO el tráfico entrante por defecto
- **Segunda línea**: Permite TODO el tráfico saliente (tu servidor puede hacer peticiones al exterior)

Esto es el principio de seguridad básico: "negar todo excepto lo que explícitamente permites"

---

## Paso 3: Permitir SSH (¡MUY IMPORTANTE!)

```bash
ufw allow 22/tcp
```

**⚠️ CRÍTICO**: Haz esto ANTES de habilitar el firewall, o te quedarás bloqueado fuera del servidor.

Esto permite conexiones entrantes al puerto 22 (SSH), para que puedas seguir conectándote.

---

## Paso 4: Permitir HTTP y HTTPS

```bash
ufw allow 80/tcp
ufw allow 443/tcp
```

Esto permite tráfico web:
- **Puerto 80**: HTTP (necesario para redirección y certificados Let's Encrypt)
- **Puerto 443**: HTTPS (tu aplicación)

---

## Paso 5: Verificar las reglas ANTES de activar

```bash
ufw show added
```

Deberías ver algo como:
```
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
```

**Verifica que el puerto 22 está en la lista**, o quedarás bloqueado.

---

## Paso 6: Activar el firewall

```bash
ufw enable
```

Te preguntará si estás seguro. Escribe `y` y Enter.

---

## Paso 7: Verificar el estado

```bash
ufw status verbose
```

Deberías ver algo como:

```
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
```

---

## Comandos útiles para el futuro

### Ver estado y reglas
```bash
# Ver estado
ufw status

# Ver estado detallado
ufw status verbose

# Ver reglas numeradas
ufw status numbered
```

### Gestionar reglas
```bash
# Permitir un puerto específico
ufw allow 8080/tcp

# Permitir un puerto UDP
ufw allow 8080/udp

# Denegar un puerto
ufw deny 8080/tcp

# Permitir desde una IP específica
ufw allow from 192.168.1.100

# Permitir desde una IP a un puerto específico
ufw allow from 192.168.1.100 to any port 22

# Eliminar una regla (por número)
ufw delete 3

# Eliminar una regla (por especificación)
ufw delete allow 8080/tcp
```

### Operaciones avanzadas
```bash
# Habilitar logging
ufw logging on

# Logging nivel medio
ufw logging medium

# Logging nivel alto (mucha info)
ufw logging high

# Deshabilitar firewall (emergencia)
ufw disable

# Resetear todo (¡cuidado! borra todas las reglas)
ufw reset
```

---

## Configuración con Cloudflare

### Lo que protege Cloudflare

Cloudflare solo protege el tráfico **HTTP/HTTPS** (puertos 80/443) que pasa por su proxy:
- DDoS protection
- WAF (Web Application Firewall)
- Rate limiting
- Oculta tu IP real (pero puede filtrarse)

### Lo que NO protege Cloudflare

1. **SSH (puerto 22)** - Está totalmente expuesto a internet
2. **Otros puertos** que puedas necesitar
3. **Ataques directos a tu IP** si alguien la descubre

### Restringir HTTP/HTTPS solo a IPs de Cloudflare

Para mayor seguridad, puedes hacer que tu servidor SOLO acepte tráfico HTTP/HTTPS desde las IPs de Cloudflare:

```bash
# Primero niega todo en 80 y 443
ufw delete allow 80/tcp
ufw delete allow 443/tcp
ufw deny 80/tcp
ufw deny 443/tcp

# Luego permite solo desde IPs de Cloudflare (IPv4)
curl https://www.cloudflare.com/ips-v4 | while read ip; do 
    ufw allow from $ip to any port 80 proto tcp
    ufw allow from $ip to any port 443 proto tcp
done

# Si usas IPv6
curl https://www.cloudflare.com/ips-v6 | while read ip; do 
    ufw allow from $ip to any port 80 proto tcp
    ufw allow from $ip to any port 443 proto tcp
done
```

---

## ¿Y si me bloqueo?

Si pierdes acceso SSH, desde la consola de Hetzner Cloud puedes:

1. Acceder por la consola web (VNC)
2. Ejecutar: `ufw disable`
3. Arreglar las reglas
4. Volver a activar: `ufw enable`

---

## Script completo de configuración básica

```bash
#!/bin/bash

# Instalar UFW
apt install -y ufw

# Configurar políticas por defecto
ufw default deny incoming
ufw default allow outgoing

# Permitir SSH (¡IMPORTANTE!)
ufw allow 22/tcp

# Permitir HTTP y HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Verificar reglas
echo "Reglas configuradas:"
ufw show added

# Activar firewall
echo "Activando firewall..."
ufw --force enable

# Mostrar estado
ufw status verbose

echo "✅ Firewall configurado correctamente"
```

---

## Verificación de seguridad

Después de configurar el firewall, puedes verificar qué puertos están abiertos desde fuera:

```bash
# Desde otro ordenador o usando una herramienta online
nmap -p- tu-ip-del-servidor

# Deberías ver solo los puertos que has permitido (22, 80, 443)
```

---

## Logs del firewall

Los logs de UFW se guardan en:
```bash
# Ver logs
tail -f /var/log/ufw.log

# Buscar intentos bloqueados
grep BLOCK /var/log/ufw.log
```

---

## Resumen de seguridad

✅ **UFW + Fail2Ban son esenciales**  
✅ **Cloudflare es una capa adicional de protección**  
✅ **NO son mutuamente excluyentes**

**Configuración óptima**: UFW + Fail2Ban + Cloudflare = Máxima seguridad

---

## Checklist de configuración

- [ ] UFW instalado
- [ ] Política por defecto: deny incoming
- [ ] Puerto 22 (SSH) permitido
- [ ] Puerto 80 (HTTP) permitido
- [ ] Puerto 443 (HTTPS) permitido
- [ ] Firewall activado
- [ ] Estado verificado con `ufw status verbose`
- [ ] Fail2Ban configurado
- [ ] Cloudflare configurado (opcional pero recomendado)
