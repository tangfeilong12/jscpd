import Blamer from 'blamer';
import {IBlamedLines, IClone} from '@jscpd/core';
import {yellow} from 'colors/safe';
import {IHook} from '..';


export class BlamerHook implements IHook {

	process(clones: IClone[]): Promise<IClone[]> {
		return Promise.all(clones.map((clone: IClone) => BlamerHook.blameLines(clone)));
	}

	static async blameLines(clone: IClone) {
		const blamer = new Blamer();
		try {
			const blamedFileA: Record<string, IBlamedLines> = await blamer.blameByFile(clone.duplicationA.sourceId);
			const blamedFileB: Record<string, IBlamedLines> = await blamer.blameByFile(clone.duplicationB.sourceId);
			clone.duplicationA.blame = BlamerHook.getBlamedLines(blamedFileA, clone.duplicationA.start.line, clone.duplicationA.end.line);
			clone.duplicationB.blame = BlamerHook.getBlamedLines(blamedFileB, clone.duplicationB.start.line, clone.duplicationB.end.line);
		} catch (e) {
			console.log(yellow(`Error: ${e.toString()}`));
		}
		return clone;
	}

	static getBlamedLines(blamedFiles: Record<string, IBlamedLines>, start: number, end: number): IBlamedLines {
		// TODO rewrite the method
		const [file] = Object.keys(blamedFiles);
		const result: IBlamedLines = {};
		Object.keys(blamedFiles[file])
			.filter((lineNumber) => {
				return Number(lineNumber) >= start && Number(lineNumber) <= end;
			})
			.map((lineNumber) => blamedFiles[file][lineNumber])
			.forEach((info) => {
				result[info.line] = info;
			});
		return result;
	}
}

