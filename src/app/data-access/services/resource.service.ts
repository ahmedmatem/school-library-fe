import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Resource } from '../models/resource.model';

export interface ResourceFilters {
  query?: string;
  subject?: string;
  type?: 'FILE' | 'LINK';
  format?: string;
  tag?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private http = inject(HttpClient);
  private url = '/assets/mock/resources.json';
  
  getAll(filters?: ResourceFilters): Observable<Resource[]> {
    return this.http.get<Resource[]>(this.url).pipe(
      map(list => this.applyFilters(list, filters))
    );
  }

  getById(id: string): Observable<Resource | undefined> {
    return this.http.get<Resource[]>(this.url).pipe(
      map(list => list.find(x => x.id === id))
    );
  }

  private applyFilters(list: Resource[], f?: ResourceFilters): Resource[] {
    if (!f) return list;

    const q = (f.query ?? '').trim().toLowerCase();
    return list.filter(r => {
      if (q && !(r.title.toLowerCase().includes(q) || (r.author ?? '').toLowerCase().includes(q))) return false;
      if (f.subject && r.subject !== f.subject) return false;
      if (f.type && r.type !== f.type) return false;
      if (f.format && r.format !== f.format) return false;
      if (f.tag && !r.tags.includes(f.tag)) return false;
      return true;
    });
  }
}
