#!/usr/bin/env tsx
// OpenAPI Schema Validation Script
// Validates the openapi.yml file against OpenAPI 3.0 specification

import { readFileSync } from 'fs';
import { join } from 'path';
import { validate } from 'jsonschema';
import YAML from 'yaml';

const OPENAPI_SCHEMA = {
  type: 'object',
  required: ['openapi', 'info', 'paths'],
  properties: {
    openapi: { type: 'string', pattern: '^3\\.0\\.[0-9]+$' },
    info: {
      type: 'object',
      required: ['title', 'version'],
      properties: {
        title: { type: 'string' },
        version: { type: 'string' },
        description: { type: 'string' },
      },
    },
    paths: {
      type: 'object',
      patternProperties: {
        '^/': {
          type: 'object',
          patternProperties: {
            '^(get|post|put|patch|delete|head|options)$': {
              type: 'object',
              required: ['responses'],
              properties: {
                tags: { type: 'array', items: { type: 'string' } },
                summary: { type: 'string' },
                description: { type: 'string' },
                parameters: { type: 'array' },
                requestBody: { type: 'object' },
                responses: { type: 'object' },
                security: { type: 'array' },
              },
            },
          },
        },
      },
    },
    components: {
      type: 'object',
      properties: {
        schemas: { type: 'object' },
        responses: { type: 'object' },
        parameters: { type: 'object' },
        securitySchemes: { type: 'object' },
      },
    },
    servers: { type: 'array' },
    security: { type: 'array' },
  },
};

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateOpenAPIFile(filePath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Read and parse YAML file
    const fileContent = readFileSync(filePath, 'utf8');
    const openapiSpec = YAML.parse(fileContent);

    // Validate against OpenAPI schema
    const result = validate(openapiSpec, OPENAPI_SCHEMA);
    
    if (!result.valid) {
      result.errors.forEach(error => {
        errors.push(`${error.property}: ${error.message}`);
      });
    }

    // Additional custom validations
    validateCustomRules(openapiSpec, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(`Failed to parse YAML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      valid: false,
      errors,
      warnings,
    };
  }
}

function validateCustomRules(spec: any, errors: string[], warnings: string[]): void {
  // Check for required security schemes
  if (!spec.components?.securitySchemes) {
    errors.push('Missing securitySchemes in components');
  } else {
    const securitySchemes = spec.components.securitySchemes;
    if (!securitySchemes.BearerAuth) {
      errors.push('Missing BearerAuth security scheme');
    }
    if (!securitySchemes.OrgHeader) {
      errors.push('Missing OrgHeader security scheme');
    }
  }

  // Check for required response schemas
  const requiredResponses = ['BadRequest', 'Unauthorized', 'Forbidden', 'NotFound', 'RateLimited'];
  if (spec.components?.responses) {
    requiredResponses.forEach(responseName => {
      if (!spec.components.responses[responseName]) {
        warnings.push(`Missing ${responseName} response schema`);
      }
    });
  }

  // Check for consistent error response format
  if (spec.components?.schemas?.ErrorResponse) {
    const errorSchema = spec.components.schemas.ErrorResponse;
    if (!errorSchema.properties?.error) {
      errors.push('ErrorResponse schema must have error property');
    }
  }

  // Check for pagination consistency
  const paginatedEndpoints = Object.keys(spec.paths).filter(path => 
    spec.paths[path].get?.parameters?.some((param: any) => param.name === 'limit')
  );

  paginatedEndpoints.forEach(path => {
    const getOperation = spec.paths[path].get;
    const response200 = getOperation.responses?.['200'];
    
    if (response200?.content?.['application/json']?.schema) {
      const schema = response200.content['application/json'].schema;
      if (!schema.properties?.data && !schema.properties?.nextCursor) {
        warnings.push(`Endpoint ${path} appears to be paginated but missing data/nextCursor properties`);
      }
    }
  });

  // Check for proper HTTP status codes
  Object.keys(spec.paths).forEach(path => {
    Object.keys(spec.paths[path]).forEach(method => {
      const operation = spec.paths[path][method];
      const responses = operation.responses || {};
      
      // Check for appropriate status codes
      const statusCodes = Object.keys(responses).map(Number);
      
      if (method === 'post' && !statusCodes.includes(201)) {
        warnings.push(`POST ${path} should include 201 Created response`);
      }
      
      if (method === 'patch' && !statusCodes.includes(200)) {
        warnings.push(`PATCH ${path} should include 200 OK response`);
      }
      
      if (method === 'delete' && !statusCodes.includes(200)) {
        warnings.push(`DELETE ${path} should include 200 OK response`);
      }
    });
  });

  // Check for consistent parameter naming
  Object.keys(spec.paths).forEach(path => {
    Object.keys(spec.paths[path]).forEach(method => {
      const operation = spec.paths[path][method];
      const parameters = operation.parameters || [];
      
      parameters.forEach((param: any) => {
        if (param.name === 'id' && param.in === 'path' && param.schema?.format !== 'uuid') {
          warnings.push(`Path parameter 'id' in ${path} should use UUID format`);
        }
      });
    });
  });
}

function main(): void {
  const openapiPath = join(process.cwd(), 'openapi.yml');
  
  console.log('🔍 Validating OpenAPI specification...');
  console.log(`📁 File: ${openapiPath}`);
  
  const result = validateOpenAPIFile(openapiPath);
  
  if (result.valid) {
    console.log('✅ OpenAPI specification is valid!');
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => {
        console.log(`   - ${warning}`);
      });
    }
    
    process.exit(0);
  } else {
    console.log('❌ OpenAPI specification is invalid!');
    console.log('\n🚨 Errors:');
    result.errors.forEach(error => {
      console.log(`   - ${error}`);
    });
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => {
        console.log(`   - ${warning}`);
      });
    }
    
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  main();
}

export { validateOpenAPIFile, ValidationResult };
