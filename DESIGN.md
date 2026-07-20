# ScoutLine Trinidense — Sistema de Diseño

## Identidad de Marca y Objetivos

**ScoutLine Trinidense** es la plataforma SaaS de scouting de élite y gestión deportiva de **Jonathan Santana (Sporting Manager de Club Sportivo Trinidense)**. Funciona como un laboratorio de datos en vivo que fusiona el análisis avanzado de datos (métricas por 90', percentiles, similitud de jugadores, agrupamiento táctico K-Means, y datos físicos GPS) con decisiones reales en el fútbol latinoamericano.

### Principios de Diseño
1. **Autoridad y Credibilidad**: Evitar la estética genérica de paneles de control. Debe sentirse profesional, confidencial y adaptado a directores deportivos y agentes de la CONMEBOL y la MLS.
2. **Identidad del Club**: El diseño está inspirado en la paleta de colores de Club Sportivo Trinidense (navy profundo y dorado), creando un ambiente oscuro tecnológico de alta gama.
3. **Claridad Analítica**: Los datos de scouting son complejos. El diseño prioriza la legibilidad de tablas, radars de percentiles y gráficos de dispersión con tipografías monoespaciadas legibles y proporciones armónicas.

---

## Ficha de Tokens de Diseño

### Paleta de Colores
*   `--color-bg`: `#090c1f` (Fondo principal — navy profundo)
*   `--color-surface`: `#0f1330` (Superficie secundaria — contenedores y sidebar)
*   `--color-card`: `#141a3d` (Tarjetas y elementos interactivos)
*   `--color-border`: `#232a54` (Líneas divisorias y bordes estándar)
*   `--color-border-2`: `#343d72` (Bordes con hover y acentuados)
*   `--color-accent`: `#f2c230` (Acento principal — dorado Trinidense)
*   `--color-accent-2`: `#f7d35c` (Hover dorado)
*   `--color-text`: `#eef1fb` (Texto principal)
*   `--color-muted`: `#8f9bc7` (Texto secundario/desactivado)
*   `--color-muted-2`: `#626f9e` (Etiquetas muy secundarias)
*   `--color-positive`: `#34d399` (Indicadores positivos — verde esmeralda)
*   `--color-negative`: `#f87171` (Indicadores negativos — rojo coral)

### Tipografía
*   **Fuente Principal**: Inter (interfaz, textos descriptivos, etiquetas)
*   **Fuente de Display**: Archivo (títulos, números de percentiles, métricas clave)
*   **Fuente Monoespaciada**: JetBrains Mono (valores numéricos, hashes, porcentajes de similitud)

---

## Estructura de Diseño y Layout

El layout consiste en una navegación lateral persistente (`Sidebar`), un fondo con textura sutil y un contenedor de contenido principal centrado.

```
+-------------------------------------------------------------+
|  LOGO  |   Páginas principales                              |
| Trinid |   [Dashboard]                                      |
| --------   [Scouting]                                       |
|  Menú  |   [Similitud]                                      |
|  Side  |   [Algoritmos]                                     |
|        |   [Video]                                          |
|        |                                                    |
|  USER  |   Contenido Principal (Max 6xl, centrado)          |
|  Role  |                                                    |
+-------------------------------------------------------------+
```

### Componentes Clave

1.  **Sidebar**:
    *   Debe contener el logotipo `Logo` en su parte superior con el nombre del club.
    *   Enlaces activos marcados con fondo de tarjeta y texto en color `--color-accent`.
    *   Perfil de usuario abajo indicando el nombre completo (ej: Jonathan Santana) y el rol de usuario correspondiente (Administrador, Scout, Analista, Observador).
2.  **InteriorGlow**:
    *   Efecto de brillo radial gradiente en el fondo que rompe la monotonía del fondo oscuro.
3.  **Tarjetas Estadísticas (StatCards)**:
    *   Borde redondeado (`rounded-2xl`), fondo `--color-card`, efecto de elevación y hover (`hover:-translate-y-1 hover:border-border-2`).
    *   El número principal debe utilizar la fuente Display en tamaño extra-grande (`text-3xl font-black`).

---

## Pautas Específicas por Página

### 1. Dashboard (`/dashboard`)
*   Secciones de estadísticas resumidas con iconos de `lucide-react`.
*   Un bloque de "Primeros Pasos" o sugerencia si no hay datos subidos.
*   Paneles de acceso rápido a las herramientas principales.

### 2. Scouting (`/scouting`)
*   Filtros interactivos superiores (Nombre, Posición, Temporada).
*   Tablas semánticas bien estructuradas con filas interactivas que lleven al perfil del jugador.
*   Tipografía tabular para los minutos jugados.

### 3. Similitud (`/similarity`)
*   Selector de jugador de referencia con detalles de posición y filtros de mercado y minutos.
*   Los porcentajes de similitud se muestran en dorado Trinidense con tipografía monoespaciada para una alineación visual perfecta.
*   Mensajes claros en caso de que no haya coincidencia con los filtros.

### 4. Algoritmos (`/algorithms`)
*   Tres bloques fundamentales:
    1.  *Decisión Speed*: Score de velocidad mental proxy (decisiones por 90 minutos).
    2.  *Physical Gap*: Brecha física comparativa vs cohorte con colores verde/rojo para desvíos positivos y negativos.
    3.  *Team Clustering*: Agrupación K-Means para clasificar el estilo de los equipos.
*   Píldoras y etiquetas claras para los clústeres (`styleCluster`).

### 5. Asistente IA (`/assistant`)
*   Chat interactivo con selección de proveedor (Anthropic, OpenAI, Gemini).
*   Selector de contexto para enfocar la conversación en un jugador específico.
