<?php

namespace Tests\Feature;

use App\Http\Requests\UploadVerificationDocumentRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class VerificationDocumentFileTypeTest extends TestCase
{
    public function test_pdf_and_png_documents_are_allowed(): void
    {
        foreach ([
            UploadedFile::fake()->create('verification.pdf', 40, 'application/pdf'),
            UploadedFile::fake()->create('verification.png', 40, 'image/png'),
        ] as $file) {
            $validator = Validator::make(
                [
                    'document_type' => 'national_id',
                    'document' => $file,
                ],
                (new UploadVerificationDocumentRequest())->rules(),
            );

            $this->assertTrue($validator->passes());
        }
    }

    public function test_jpeg_documents_are_rejected(): void
    {
        $validator = Validator::make(
            [
                'document_type' => 'national_id',
                'document' => UploadedFile::fake()->create(
                    'verification.jpg',
                    40,
                    'image/jpeg',
                ),
            ],
            (new UploadVerificationDocumentRequest())->rules(),
        );

        $this->assertFalse($validator->passes());
        $this->assertArrayHasKey('document', $validator->errors()->messages());
    }
}
