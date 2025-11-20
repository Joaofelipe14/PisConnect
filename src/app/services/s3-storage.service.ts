import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class S3StorageService {

    private endpoint: string = 'https://rfxrzgdfiehcqhfqxxlz.storage.supabase.co'; // Endpoint do Supabase
    private bucketName: string = 'perfil'; // Nome do bucket
    private accessToken: string = environment.supabase.key



    constructor() { }

    // Função para realizar upload de foto de perfil
    async uploadFotoPerfil(usuarioId: string, file: File): Promise<string> {
        const agora = new Date();
        const timestamp = agora.toISOString().replace(/[:.-]/g, ''); // 20251120T143500000Z

        const fileExt = file.name.split('.').pop();
        const fileName = `foto_${timestamp}.${fileExt}`;
        const filePath = `${usuarioId}/${fileName}`; // Pasta com o ID do usuário

        // Faz o upload via PUT (substitui se já existir)
        const uploadRes = await fetch(`${this.endpoint}/storage/v1/object/${this.bucketName}/${filePath}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': file.type
            },
            body: file
        });

        if (!uploadRes.ok) {
            const errorText = await uploadRes.text();
            throw new Error(`Falha ao fazer upload do arquivo: ${errorText}`);
        }

        // Retorna a URL pública do arquivo
        return `${this.endpoint}/storage/v1/object/public/${this.bucketName}/${filePath}`;
    }

}