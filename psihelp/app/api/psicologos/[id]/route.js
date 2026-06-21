import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Psicologo from '@/lib/models/Psicologo';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const psicologo = await Psicologo.findById(params.id);
    
    if (!psicologo) {
      return NextResponse.json(
        { success: false, error: 'Psicólogo não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: psicologo });
  } catch (error) {
    console.error('Erro ao buscar psicólogo:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar psicólogo' },
      { status: 500 }
    );
  }
}