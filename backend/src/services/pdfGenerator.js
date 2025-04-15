import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual do módulo ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretório temporário para PDFs
const TMP_DIR = path.join(__dirname, '../../tmp');

// Garantir que o diretório temporário exista
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

/**
 * Gera um PDF de treino personalizado
 * @param {Object} workout - Dados do treino
 * @param {Object} user - Dados do usuário
 * @returns {string} - Caminho do arquivo PDF gerado
 */
export const generateWorkoutPDF = async (workout, user) => {
  return new Promise((resolve, reject) => {
    try {
      // Criar nome de arquivo único
      const fileName = `treino_${workout.id}_${Date.now()}.pdf`;
      const filePath = path.join(TMP_DIR, fileName);
      
      // Criar documento PDF
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Treino - ${workout.name}`,
          Author: 'MeuCoach App',
          Subject: 'Plano de Treino Personalizado',
        }
      });
      
      // Pipe para arquivo
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Adicionar cabeçalho
      addHeader(doc, workout, user);
      
      // Adicionar informações do treino
      addWorkoutInfo(doc, workout);
      
      // Adicionar exercícios
      addExercises(doc, workout.exercises);
      
      // Adicionar rodapé
      addFooter(doc);
      
      // Finalizar o PDF
      doc.end();
      
      stream.on('finish', () => {
        resolve(filePath);
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
      
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Adiciona o cabeçalho ao PDF
 */
const addHeader = (doc, workout, user) => {
  // Logo (substituir pelo caminho real do logo)
  // doc.image('path/to/logo.png', 50, 45, { width: 50 });
  
  // Título
  doc.fontSize(20)
     .fillColor('#3B82F6')
     .text('MeuCoach', 50, 50, { align: 'left' });
  
  doc.fontSize(24)
     .fillColor('#0F172A')
     .text(`Treino: ${workout.name}`, 50, 85, { align: 'center' });
  
  // Informações do usuário
  doc.fontSize(12)
     .fillColor('#64748B')
     .text(`Preparado para: ${user.name}`, 50, 120);
  
  doc.fontSize(12)
     .fillColor('#64748B')
     .text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 50, 140);
  
  // Linha horizontal
  doc.moveTo(50, 165)
     .lineTo(550, 165)
     .strokeColor('#E2E8F0')
     .stroke();
};

/**
 * Adiciona informações gerais do treino
 */
const addWorkoutInfo = (doc, workout) => {
  doc.fontSize(14)
     .fillColor('#0F172A')
     .text('Informações do Treino', 50, 185);
  
  // Detalhes do treino em 2 colunas
  const detailsY = 215;
  
  // Coluna 1
  doc.fontSize(12)
     .fillColor('#64748B')
     .text('Categoria:', 50, detailsY)
     .text('Dificuldade:', 50, detailsY + 25)
     .text('Duração:', 50, detailsY + 50);
  
  // Coluna 2
  doc.fontSize(12)
     .fillColor('#0F172A')
     .text(workout.category, 150, detailsY)
     .text(workout.difficulty, 150, detailsY + 25)
     .text(`${workout.duration} minutos`, 150, detailsY + 50);
  
  // Descrição
  if (workout.description) {
    doc.fontSize(12)
       .fillColor('#64748B')
       .text('Descrição:', 50, detailsY + 85);
    
    doc.fontSize(12)
       .fillColor('#0F172A')
       .text(workout.description, 50, detailsY + 105, {
         width: 500,
         align: 'justify'
       });
  }
  
  // Linha horizontal
  const lineY = workout.description 
    ? detailsY + 105 + Math.min(doc.heightOfString(workout.description, { width: 500 }), 100) + 20
    : detailsY + 85;
  
  doc.moveTo(50, lineY)
     .lineTo(550, lineY)
     .strokeColor('#E2E8F0')
     .stroke();
  
  return lineY + 20;
};

/**
 * Adiciona os exercícios ao PDF
 */
const addExercises = (doc, exercises) => {
  let currentY = 350;
  
  doc.fontSize(16)
     .fillColor('#0F172A')
     .text('Exercícios', 50, currentY);
  
  currentY += 30;
  
  exercises.forEach((exercise, index) => {
    // Verificar se precisa de nova página
    if (currentY > 700) {
      doc.addPage();
      currentY = 50;
    }
    
    // Box para cada exercício
    doc.rect(50, currentY, 500, 100)
       .fillColor('#F8FAFC')
       .fill();
    
    // Número do exercício
    doc.rect(50, currentY, 40, 100)
       .fillColor('#3B82F6')
       .fill();
    
    doc.fontSize(18)
       .fillColor('#FFFFFF')
       .text(`${index + 1}`, 50, currentY + 40, {
         width: 40,
         align: 'center'
       });
    
    // Detalhes do exercício
    doc.fontSize(14)
       .fillColor('#0F172A')
       .text(exercise.name, 100, currentY + 15);
    
    doc.fontSize(12)
       .fillColor('#64748B')
       .text(`Séries: ${exercise.sets}`, 100, currentY + 40);
    
    doc.fontSize(12)
       .fillColor('#64748B')
       .text(`Repetições: ${exercise.reps}`, 230, currentY + 40);
    
    doc.fontSize(12)
       .fillColor('#64748B')
       .text(`Descanso: ${exercise.rest_seconds}s`, 370, currentY + 40);
    
    if (exercise.notes) {
      doc.fontSize(12)
         .fillColor('#64748B')
         .text(`Observações: ${exercise.notes}`, 100, currentY + 65, {
           width: 430
         });
    }
    
    currentY += 120;
  });
  
  return currentY;
};

/**
 * Adiciona o rodapé ao PDF
 */
const addFooter = (doc) => {
  // Garantir que estamos na parte inferior da página
  const pageBottom = 800;
  
  // Linha horizontal
  doc.moveTo(50, pageBottom - 50)
     .lineTo(550, pageBottom - 50)
     .strokeColor('#E2E8F0')
     .stroke();
  
  // Texto de rodapé
  doc.fontSize(10)
     .fillColor('#94A3B8')
     .text(
       'Este plano de treino foi gerado pelo aplicativo MeuCoach. Para mais informações, entre em contato com seu treinador.',
       50,
       pageBottom - 40,
       { align: 'center', width: 500 }
     );
  
  // Número da página
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    
    doc.fontSize(10)
       .fillColor('#94A3B8')
       .text(
         `Página ${i + 1} de ${pageCount}`,
         50,
         pageBottom - 15,
         { align: 'right', width: 500 }
       );
  }
};

/**
 * Remove um arquivo PDF após determinado tempo
 * @param {string} filePath - Caminho do arquivo
 * @param {number} delay - Tempo em ms antes de remover (padrão: 5 minutos)
 */
export const cleanupPDF = (filePath, delay = 5 * 60 * 1000) => {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }, delay);
}; 