# Guía completa de Fail2Ban

## ¿Qué es Fail2Ban?

Fail2Ban es un software que monitorea los logs del sistema buscando patrones de intentos fallidos de login. Cuando detecta múltiples intentos fallidos desde una IP, la **banea temporalmente** bloqueándola en el firewall.

### ¿Por qué lo necesitas?

Literalmente **en minutos** de exponer tu servidor a internet, verás miles de bots intentando entrar por SSH probando combinaciones de usuario/contraseña. Fail2Ban los bloquea automáticamente.

---

## Paso 1: Instalar Fail2Ban

```bash
apt update
apt install -y fail2ban
```

---

## Paso 2: Entender la estructura de archivos

Fail2Ban tiene dos archivos principales:

- **`/etc/fail2ban/jail.conf`** - Configuración por defecto (NO lo edites)
- **`/etc/fail2ban/jail.local`** - Tu configuración personalizada (este SÍ)

El archivo `.local` sobrescribe el `.conf`, así las actualizaciones no rompen tu configuración.

---

## Paso 3: Crear configuración personalizada

Crea el archivo `jail.local`:

```bash
nano /etc/fail2ban/jail.local
```

Pega esta configuración básica:

```ini
[DEFAULT]
# Tiempo de baneo en segundos (3600 = 1 hora)
bantime = 3600

# Ventana de tiempo para contar intentos fallidos (600 = 10 minutos)
findtime = 600

# Número máximo de intentos fallidos antes del baneo
maxretry = 5

# Lista blanca de IPs que NUNCA serán baneadas (añade la tuya si tienes IP fija)
ignoreip = 127.0.0.1/8 ::1

# Acción a tomar cuando se detecta un ataque
# %(action_mwl)s = banear + enviar email con whois y logs
# %(action_mw)s = banear + enviar email con whois
# %(action_)s = solo banear (recomendado si no tienes email configurado)
banaction = ufw
action = %(action_)s

[sshd]
# Habilitar protección SSH
enabled = true

# Puerto SSH (cambia si usas otro puerto)
port = 22

# Archivo de log a monitorear
logpath = %(sshd_log)s

# Backend para leer logs (systemd es más eficiente en sistemas modernos)
backend = systemd

# Puedes sobrescribir valores de DEFAULT aquí
maxretry = 5
```

Guarda con **Ctrl+X**, luego **Y**, luego **Enter**.

---

## Paso 4: Entender los parámetros clave

### bantime
- Tiempo que una IP permanece baneada
- `3600` = 1 hora
- `-1` = permanente (no recomendado, puede banearte a ti mismo)
- `86400` = 24 horas

### findtime
- Ventana de tiempo para contar intentos fallidos
- Si hay `maxretry` fallos en estos segundos, se banea
- `600` = 10 minutos es razonable

### maxretry
- Número de intentos fallidos permitidos
- `5` es un buen balance (permite errores humanos, bloquea bots)
- `3` es más agresivo

### ignoreip
Añade tu IP fija aquí si la tienes, para no banearte a ti mismo:

```ini
ignoreip = 127.0.0.1/8 ::1 203.0.113.50
```

---

## Paso 5: Verificar la configuración

Antes de iniciar el servicio, verifica que no hay errores:

```bash
fail2ban-client -t
```

Si ves `OK` al final, todo está bien.

---

## Paso 6: Iniciar y habilitar Fail2Ban

```bash
# Iniciar el servicio
systemctl start fail2ban

# Habilitar para que arranque con el sistema
systemctl enable fail2ban

# Verificar que está corriendo
systemctl status fail2ban
```

Deberías ver **active (running)** en verde.

---

## Paso 7: Verificar que está funcionando

### Ver estado general
```bash
fail2ban-client status
```

Deberías ver:
```
Status
|- Number of jail:      1
`- Jail list:   sshd
```

### Ver estado específico de SSH
```bash
fail2ban-client status sshd
```

Verás:
```
Status for the jail: sshd
|- Filter
|  |- Currently failed: 0
|  |- Total failed:     0
|  `- File list:        /var/log/auth.log
`- Actions
   |- Currently banned: 0
   |- Total banned:     0
   `- Banned IP list:
```

---

## Comandos útiles para gestionar Fail2Ban

### Ver IPs baneadas
```bash
fail2ban-client status sshd
```

### Banear una IP manualmente
```bash
fail2ban-client set sshd banip 192.168.1.100
```

### Desbanear una IP
```bash
fail2ban-client set sshd unbanip 192.168.1.100
```

### Ver logs de Fail2Ban
```bash
tail -f /var/log/fail2ban.log
```

### Reiniciar Fail2Ban
```bash
systemctl restart fail2ban
```

### Recargar configuración sin reiniciar
```bash
fail2ban-client reload
```

---

## Configuración avanzada (opcional)

### Proteger también Nginx/Apache

Si quieres proteger tu servidor web de ataques:

```bash
nano /etc/fail2ban/jail.local
```

Añade al final:

```ini
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log

[nginx-badbots]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
```

Luego reinicia:
```bash
systemctl restart fail2ban
```

---

## Configuración para mayor seguridad

Si quieres ser más estricto con SSH:

```bash
nano /etc/fail2ban/jail.local
```

Cambia el bloque `[sshd]`:

```ini
[sshd]
enabled = true
port = 22
logpath = %(sshd_log)s
backend = systemd
maxretry = 3        # Solo 3 intentos
bantime = 86400     # Baneo de 24 horas
findtime = 600      # En 10 minutos
```

---

## Verificar que funciona en la práctica

### Simular un ataque (desde otro ordenador)

Intenta conectarte con contraseña incorrecta 5 veces:

```bash
ssh usuario-falso@tu-servidor-ip
```

Después del 5º intento, deberías ver:
```
Connection refused
```

Y en el servidor:
```bash
fail2ban-client status sshd
```

Verás la IP baneada:
```
`- Banned IP list:   203.0.113.50
```

---

## Logs y monitoreo

### Ver intentos de login fallidos
```bash
grep 'Failed password' /var/log/auth.log | tail -20
```

### Ver IPs baneadas recientemente
```bash
tail -50 /var/log/fail2ban.log | grep 'Ban'
```

### Ver desbaneos
```bash
tail -50 /var/log/fail2ban.log | grep 'Unban'
```

### Ver reglas UFW añadidas por Fail2Ban
```bash
ufw status numbered
```

Verás reglas como:
```
[5] Anywhere                   DENY IN    192.168.1.100
```

---

## Notificaciones por email (opcional)

Si quieres recibir emails cuando se banea una IP:

```bash
apt install -y sendmail
```

Edita `jail.local`:

```ini
[DEFAULT]
destemail = tu@email.com
sendername = Fail2Ban
action = %(action_mwl)s
```

---

## Troubleshooting

### Fail2Ban no arranca
```bash
# Ver logs detallados
journalctl -u fail2ban -n 50

# Verificar sintaxis
fail2ban-client -t
```

### Me he baneado a mí mismo
Desde la consola de Hetzner:
```bash
fail2ban-client set sshd unbanip TU-IP
```

### Fail2Ban no está baneando
Verifica que los logs existen:
```bash
ls -la /var/log/auth.log
tail -f /var/log/fail2ban.log
```

---

## Script completo de instalación

```bash
#!/bin/bash

# Instalar Fail2Ban
apt update
apt install -y fail2ban

# Crear configuración
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
ignoreip = 127.0.0.1/8 ::1
banaction = ufw
action = %(action_)s

[sshd]
enabled = true
port = 22
logpath = %(sshd_log)s
backend = systemd
maxretry = 5
EOF

# Verificar configuración
fail2ban-client -t

# Iniciar y habilitar
systemctl start fail2ban
systemctl enable fail2ban

# Mostrar estado
echo "Estado de Fail2Ban:"
systemctl status fail2ban --no-pager
echo ""
echo "Jails activas:"
fail2ban-client status

echo "✅ Fail2Ban configurado correctamente"
```

---

## Integración con UFW

Fail2Ban se integra automáticamente con UFW. Cuando banea una IP:

1. Añade una regla de DENY en UFW
2. La IP no puede conectarse a ningún puerto
3. Cuando expira el baneo, elimina la regla automáticamente

Puedes verificar las reglas añadidas:
```bash
ufw status numbered
```

---

## Checklist de configuración

- [ ] Fail2Ban instalado
- [ ] Archivo `/etc/fail2ban/jail.local` creado
- [ ] Configuración verificada con `fail2ban-client -t`
- [ ] Servicio iniciado y habilitado
- [ ] Estado verificado con `fail2ban-client status`
- [ ] Jail SSH activa
- [ ] Integración con UFW funcionando
- [ ] Logs monitoreándose correctamente

---

## Monitoreo continuo

### Script para ver intentos en tiempo real

Crea un script para monitorear:

```bash
#!/bin/bash
echo "=== Fail2Ban Status ==="
fail2ban-client status sshd

echo ""
echo "=== Últimos intentos fallidos ==="
grep 'Failed password' /var/log/auth.log | tail -10

echo ""
echo "=== Últimos baneos ==="
grep 'Ban' /var/log/fail2ban.log | tail -5
```

### Comando para estadísticas
```bash
# Ver cuántas IPs han sido baneadas hoy
grep "$(date '+%Y-%m-%d')" /var/log/fail2ban.log | grep -c 'Ban'

# Ver todas las IPs baneadas históricamente
grep 'Ban' /var/log/fail2ban.log | awk '{print $NF}' | sort | uniq
```

---

## Consideraciones finales

✅ **Fail2Ban + UFW** = Protección básica esencial  
✅ **Logs automáticos** para auditoría  
✅ **Baneo temporal** evita bloqueos permanentes accidentales  
✅ **Fácil de mantener** y monitorear  

**Recomendación**: Revisa los logs semanalmente para ver patrones de ataque y ajustar la configuración si es necesario.
