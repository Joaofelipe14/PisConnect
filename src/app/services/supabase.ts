import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key
    );
  }

  async buscarPsicologos() {
    const { data, error } = await this.supabase
      .from('psicologos')
      .select('*')
      .order('criado_em', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async buscarPsicologoPorId(id: string) {
    const { data, error } = await this.supabase
      .from('psicologos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

async uploadFotoPerfil(usuarioId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `foto_${usuarioId}.${fileExt}`;
  const filePath = `${usuarioId}/${fileName}`;

  const { error: uploadError } = await this.supabase.storage
    .from('perfil')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = this.supabase.storage
    .from('perfil')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}


}