class ContactHelper {

  resolveContacts(contacts: Contact[]): void {
    contacts.forEach((contact: Contact) => {
      contact.resolve();
    });
  } 

  detectContactRectangleRectangle(o1: PhysicsObject, o2: PhysicsObject, r1: p5.Vector[], r2: p5.Vector[]): Contact | null {

    const insideRight: boolean = r1[1].x >= r2[0].x;
    const insideLeft: boolean = r1[0].x <= r2[1].x;
    const insideBottom: boolean = r1[2].y >= r2[0].y;
    const insideTop: boolean = r1[0].y <= r2[2].y;

    // Get contacts for each collision
    if (insideRight && insideLeft && insideBottom && insideTop) {

      const penLeft: number = r1[1].x - r2[0].x;
      const penRight: number = r2[1].x - r1[0].x;
      const penTop: number = r1[2].y - r2[0].y;
      const penBottom: number = r2[2].y - r1[0].y;

      const minPen: number = Math.min(Math.min(penLeft, penRight), Math.min(penTop, penBottom));

      let contactNormal: p5.Vector = createVector(0, 0);

      if (minPen == penLeft) {
        contactNormal.set(-1, 0);
      } else if (minPen == penRight) {
        contactNormal.set(1, 0);
      } else if (minPen == penTop) {
        contactNormal.set(0, -1);
      } else {
        contactNormal.set(0, 1);
      }


      const c: number = 0.0;

      return new Contact(o1, o2, c, minPen, contactNormal);
    }
    
    return null;

  }

  pointInEllipse(eWidth: number, eHeight: number, eOrigin: p5.Vector, p: p5.Vector): boolean {
    let diff: p5.Vector = p.copy().sub(eOrigin);
    diff.x /= (eWidth / 2);
    diff.y /= (eHeight / 2);

    return diff.magSq() <= 1.0;
  }

  detectContactEllipseRectangle(o1: PhysicsObject, o2: PhysicsObject, eWidth: number, eHeight: number, eOrigin: p5.Vector, rBBOX: p5.Vector[]): Contact | null {

    // Check if the bounding box collides
    
    const eMinX: number = eOrigin.x - eWidth / 2;
    const eMaxX: number = eOrigin.x + eWidth / 2;
    const eMinY: number = eOrigin.y - eHeight / 2;
    const eMaxY: number = eOrigin.y + eHeight / 2;

    let eBBOX: p5.Vector[] = [];
    eBBOX.push(createVector(eMinX, eMinY));
    eBBOX.push(createVector(eMaxX, eMinY));
    eBBOX.push(createVector(eMaxX, eMaxY));
    eBBOX.push(createVector(eMinX, eMaxY));
    
    if (this.detectContactRectangleRectangle(o1, o2, eBBOX, rBBOX) == null) {
        return null;
    }

    // Check if any of the rectangle vertices are in the ellipse
    let vertexInside: boolean = false;
    for (const p of rBBOX) {
      if (this.pointInEllipse(eWidth, eHeight, eOrigin, p)) {
        vertexInside = true;
        break;
      } 
    };


    if (vertexInside) {
      let diff: p5.Vector = o2.position.copy();
      diff.sub(o1.position);

      let contactNormal: p5.Vector = diff.normalize();

      return new Contact(o1, o2, 0, diff.mag(), contactNormal);
    }
    
    // Otherwise, we need to check if any of the lines intersect with the ellipse 
    // TODO: ellipse rectangle full contact

    return null;

  }


  detectFloorContact(o1: PhysicsObject, o2: PhysicsObject, c: number): Contact | null {

    // Get the walking bbox for the player
    const bbox1: p5.Vector[] = o1.getFloorBBOX();

    // Get the bounding box of the object
    const bbox2: p5.Vector[] = o2.getFloorBBOX();

    let contact: Contact | null = this.detectContactRectangleRectangle(o1, o2, bbox1, bbox2);

    if (contact != null) {
      contact.c = c;
    }

    return contact;
  }


  detectContact(o1: PhysicsObject, o2: PhysicsObject): Contact | null {
    return this.detectContactRectangleRectangle(o1, o2, o1.getBBOX(), o2.getBBOX());
  }

  // detectMeleeContact(weapon: MeleeWeapon, wielder: PhysicsObject, object: PhysicsObject): Contact | null{

  //   wBBOX: p5.Vector[] = weapon.getBBOX(); 
  //   oBBOX: p5.Vector[] = object.getBBOX();

  //   const contact: Contact = this.detectContactRectangleRectangle(wielder, object, wBBOX, oBBOX);

  //   if (contact != null && this.detectContactEllipseRectangle(wielder, object, weapon.attackRangeWidth, weapon.attackRangeHeight, weapon.origin, oBBOX) != null) {
  //     return contact;
  //   } else {
  //     return null;
  //   }

  // }

}
