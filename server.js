import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Configuración de Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || "https://crdlpylvxwcewfredjrw.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZGxweWx2eHdjZXdmcmVkanJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MTEwMDIsImV4cCI6MjEwNDk4NzAwMn0.Y7BH5B9781k4Fm23opp83NGQUqSP_FayQTpCYXbM8T4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// API REST DE HORARIOS CON SUPABASE
// ==========================================

// 1. Estado de la conexión
app.get("/api/status", async (req, res) => {
  try {
    const { data, error } = await supabase.from("horarios").select("id").limit(1);
    if (error) {
      return res.json({
        connected: false,
        error: error.message,
        code: error.code,
        url: SUPABASE_URL,
        usingServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      });
    }
    return res.json({
      connected: true,
      url: SUPABASE_URL,
      usingServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });
  } catch (err) {
    return res.status(500).json({ connected: false, error: err.message });
  }
});

// 2. Obtener todos los horarios con sus clases
app.get("/api/horarios", async (req, res) => {
  try {
    const { data: horarios, error: errHorarios } = await supabase
      .from("horarios")
      .select("*")
      .order("id", { ascending: false });

    if (errHorarios) {
      return res.status(500).json({ error: errHorarios.message, code: errHorarios.code });
    }

    if (!horarios || horarios.length === 0) {
      return res.json({ horarios: [] });
    }

    const ids = horarios.map((h) => h.id);

    const { data: clases, error: errClases } = await supabase
      .from("clases")
      .select("*")
      .in("horario_id", ids);

    if (errClases) {
      console.warn("Advertencia al obtener clases de Supabase:", errClases.message);
    }

    const NUM_DIAS = 5;
    const NUM_CLASES = 6;

    const horariosCompletos = horarios.map((h) => {
      const hClases = (clases || []).filter((c) => Number(c.horario_id) === Number(h.id));

      const dias = [];
      for (let dia = 1; dia <= NUM_DIAS; dia++) {
        const clasesDia = [];
        for (let clase = 1; clase <= NUM_CLASES; clase++) {
          const item = hClases.find((c) => Number(c.dia) === dia && Number(c.clase) === clase);
          clasesDia.push({
            clase: clase,
            inicio: item ? (item.hora_inicio || "") : "",
            final: item ? (item.hora_final || "") : "",
            asignatura: item ? (item.asignatura || "") : "",
            docente: item ? (item.docente || "") : ""
          });
        }
        dias.push({
          dia: dia,
          clases: clasesDia
        });
      }

      return {
        id: h.id,
        nombre: h.nombre || "Horario sin nombre",
        fecha: h.fecha || new Date().toLocaleString(),
        dias: dias,
        origen: "supabase"
      };
    });

    return res.json({ horarios: horariosCompletos });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Guardar un nuevo horario con sus clases
app.post("/api/horarios", async (req, res) => {
  try {
    const { nombre, fecha, dias } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "El nombre del horario es requerido." });
    }

    // Insertar en la tabla horarios
    const { data: nuevoHorario, error: errHorario } = await supabase
      .from("horarios")
      .insert({
        nombre: nombre.trim(),
        fecha: fecha || new Date().toLocaleString()
      })
      .select()
      .single();

    if (errHorario) {
      return res.status(400).json({
        error: errHorario.message,
        code: errHorario.code,
        isRlsError: errHorario.code === "42501"
      });
    }

    const horarioId = nuevoHorario.id;

    // Preparar las filas para la tabla clases
    const clasesAInsertar = [];
    if (Array.isArray(dias)) {
      for (const diaObj of dias) {
        const diaNum = diaObj.dia;
        if (Array.isArray(diaObj.clases)) {
          for (const c of diaObj.clases) {
            clasesAInsertar.push({
              horario_id: horarioId,
              dia: diaNum,
              clase: c.clase,
              hora_inicio: c.inicio || "",
              hora_final: c.final || "",
              asignatura: c.asignatura || "",
              docente: c.docente || ""
            });
          }
        }
      }
    }

    if (clasesAInsertar.length > 0) {
      const { error: errClases } = await supabase
        .from("clases")
        .insert(clasesAInsertar);

      if (errClases) {
        console.error("Error al insertar clases en Supabase:", errClases);
      }
    }

    return res.status(201).json({
      success: true,
      horario: {
        id: horarioId,
        nombre: nuevoHorario.nombre,
        fecha: nuevoHorario.fecha,
        dias: dias,
        origen: "supabase"
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Eliminar horario y sus clases
app.delete("/api/horarios/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Eliminar primero las clases asociadas
    await supabase.from("clases").delete().eq("horario_id", id);

    // Eliminar el horario
    const { error } = await supabase.from("horarios").delete().eq("id", id);

    if (error) {
      return res.status(400).json({
        error: error.message,
        isRlsError: error.code === "42501"
      });
    }

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ARCHIVOS ESTÁTICOS Y RUTAS HTML
// ==========================================

const distDir = path.join(__dirname, "dist");
const sourceDir = path.join(__dirname, "GESTOR DE HORARIOS INOCHINCA", "codigo");
const staticDir = fs.existsSync(distDir) ? distDir : sourceDir;

app.use(express.static(staticDir));

app.get("/", (req, res) => {
  const menuPath = path.join(staticDir, "menu.html");
  if (fs.existsSync(menuPath)) {
    res.sendFile(menuPath);
  } else {
    res.sendFile(path.join(staticDir, "index.html"));
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Gestor de Horarios server running at http://0.0.0.0:${PORT}`);
});
