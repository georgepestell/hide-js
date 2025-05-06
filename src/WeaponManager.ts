class WeaponManager<WeaponType extends Weapon> extends UIElement {

  wielder: Wielder;
  weapon: WeaponType | null;

  constructor(wielder: Wielder, w: number, h: number) {
    super(w, h);
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

  detectContact(object: PhysicsObject): Contact | null {
    if (this.weapon == null || object == null || this.wielder == null) {
      return null;
    }

    if (this.weapon instanceof MeleeWeapon) {
      const meleeWeapon: MeleeWeapon = this.weapon as MeleeWeapon;

      if (!meleeWeapon.isAttacking) {
        return null;
      }

      let contact: Contact | null;
      if (this.wielder instanceof PhysicsObject) {
        contact = ch.detectMeleeContact(meleeWeapon, this.wielder as PhysicsObject, object);
      } else {
        contact = null;
      }

      if (contact != null) {
        contact.contactNormal.set(-Math.cos(meleeWeapon.rotation), -Math.sin(meleeWeapon.rotation));
        contact.weapon = this.weapon;
      }
  
      return contact;
    }
  
    Error("Weapon type contacts not yet implemented");
    return null;
  
  }

  display(): void {
    stroke(255);
    fill(0);

    let icon: p5.Image = weaponPlaceholderArt;

    if (this.weapon != null) {
      icon = this.weapon.icon;
    } 

    image(icon, this.x, this.y, this.w, this.h);

    noStroke();
  }

} 
