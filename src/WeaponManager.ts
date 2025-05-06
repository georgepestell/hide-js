class WeaponManager<WeaponType extends Weapon> {

  wielder: Wielder;
  weapon: WeaponType | null;

  constructor(wielder: Wielder, w: number, h: number) {
    // TODO: UI ELEMENT W and H
    this.wielder = wielder;
    this.weapon = null;
  } 

  attack(): void {
    if (this.weapon != null) {
      this.weapon.attack();
    }
  }

  integrate(): void {
    if (this.weapon != null && this.wielder != null) {
      this.weapon.origin.set(this.wielder.getWeaponOrigin());

      if (!this.weapon.isAttacking) {
        this.weapon.rotation = this.wielder.getRotation();
      }
    }
  }

  setWeapon(weapon: WeaponType): void {
    this.weapon = weapon;
  }

  removeWeapon(): void {
    this.weapon = null;
  }

  // detectContact(object: PhysicsObject): Contact | null {
  //   if (this.weapon == null || object == null || this.wielder == null) {
  //     return null;
  //   }

  //   if (this.weapon instanceof MeleeWeapon) {
  //     const meleeWeapon: MeleeWeapon = weapon as MeleeWeapon;

  //     if (!meleeWeapon.isAttacking) {
  //       return null;
  //     }

  //     const contact: Contact | null = ch.detectMeleeContact(meleeWeapon, this.wielder as PhysicsObject, object);

  //     if (contact != null) {
  //       contact.contactNormal.set(-Math.cos(meleeWeapon.rotation), -Math.sin(meleeWeapon.rotation));
  //       contact.weapon = weapon;
  //     }
  //
  //     return contact;
  //   }
  //
  //   Error("Weapon type contacts not yet implemented");
  //   return null;
  //
  // }

} 
