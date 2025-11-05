import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador customizado para verificar se uma data não é anterior a outra
 */
export function dateNotBeforeValidator(beforeDateControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Não validar se estiver vazio (campo opcional)
    }

    const formGroup = control.parent;
    if (!formGroup) {
      return null;
    }

    const beforeDateControl = formGroup.get(beforeDateControlName);
    if (!beforeDateControl || !beforeDateControl.value) {
      return null; // Não validar se a data de referência não existir
    }

    const beforeDate = new Date(beforeDateControl.value);
    const currentDate = new Date(control.value);

    beforeDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    if (currentDate < beforeDate) {
      return {
        dateNotBefore: {
          message: `A data de pagamento não pode ser anterior à data de vencimento`
        }
      };
    }

    return null;
  };
}

/**
 * Validador para telefone brasileiro (formato flexível)
 */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || control.value.trim() === '') {
      return null; // Telefone é opcional
    }

    const phone = control.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    // Deve ter entre 10 e 11 dígitos (com ou sem DDD)
    if (phone.length < 10 || phone.length > 11) {
      return {
        phoneInvalid: {
          message: 'Telefone inválido. Use o formato (00) 00000-0000 ou (00) 0000-0000'
        }
      };
    }

    return null;
  };
}

/**
 * Validador para nome (mínimo de caracteres, sem apenas espaços)
 */
export function nameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Será validado pelo required separadamente
    }

    const name = control.value.trim();

    if (name.length < 2) {
      return {
        nameMinLength: {
          message: 'O nome deve ter pelo menos 2 caracteres'
        }
      };
    }

    if (name.length > 100) {
      return {
        nameMaxLength: {
          message: 'O nome deve ter no máximo 100 caracteres'
        }
      };
    }

    // Verificar se não é apenas números
    if (/^\d+$/.test(name)) {
      return {
        nameInvalid: {
          message: 'O nome não pode conter apenas números'
        }
      };
    }

    return null;
  };
}

/**
 * Validador para valor monetário positivo
 */
export function positiveAmountValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Será validado pelo required separadamente
    }

    const value = parseFloat(control.value);

    if (isNaN(value)) {
      return {
        amountInvalid: {
          message: 'Valor inválido'
        }
      };
    }

    if (value <= 0) {
      return {
        amountPositive: {
          message: 'O valor deve ser maior que zero'
        }
      };
    }

    if (value > 999999999.99) {
      return {
        amountMax: {
          message: 'O valor máximo permitido é R$ 999.999.999,99'
        }
      };
    }

    return null;
  };
}

/**
 * Validador para data não pode ser no passado (opcional, para campos que devem ser futuros)
 */
export function notPastDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Não validar se estiver vazio
    }

    const selectedDate = new Date(control.value);
    const today = new Date();

    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return {
        pastDate: {
          message: 'A data não pode ser anterior a hoje'
        }
      };
    }

    return null;
  };
}

/**
 * Helper para obter mensagem de erro amigável
 */
export function getErrorMessage(control: AbstractControl | null): string {
  if (!control || !control.errors || !control.touched) {
    return '';
  }

  const errors = control.errors;

  if (errors['required']) {
    return 'Este campo é obrigatório';
  }

  if (errors['min']) {
    return `O valor mínimo é ${errors['min'].min}`;
  }

  if (errors['minlength']) {
    return `O campo deve ter pelo menos ${errors['minlength'].requiredLength} caracteres`;
  }

  if (errors['maxlength']) {
    return `O campo deve ter no máximo ${errors['maxlength'].requiredLength} caracteres`;
  }

  if (errors['email']) {
    return 'Email inválido';
  }

  if (errors['phoneInvalid']) {
    return errors['phoneInvalid'].message || 'Telefone inválido';
  }

  if (errors['nameMinLength']) {
    return errors['nameMinLength'].message || 'Nome muito curto';
  }

  if (errors['nameMaxLength']) {
    return errors['nameMaxLength'].message || 'Nome muito longo';
  }

  if (errors['nameInvalid']) {
    return errors['nameInvalid'].message || 'Nome inválido';
  }

  if (errors['amountInvalid']) {
    return errors['amountInvalid'].message || 'Valor inválido';
  }

  if (errors['amountPositive']) {
    return errors['amountPositive'].message || 'Valor deve ser positivo';
  }

  if (errors['amountMax']) {
    return errors['amountMax'].message || 'Valor muito alto';
  }

  if (errors['dateNotBefore']) {
    return errors['dateNotBefore'].message || 'Data inválida';
  }

  if (errors['pastDate']) {
    return errors['pastDate'].message || 'Data inválida';
  }

  return 'Valor inválido';
}

